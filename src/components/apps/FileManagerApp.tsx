import React, { useState, useEffect } from 'react';
import { AppIcon } from '../AppIcon';
import { ArrowLeft, HardDrive, Folder, ChevronRight, FileText, Image, RefreshCw, Trash2, Eye, Plus, Upload, Edit3, Download } from 'lucide-react';
import { VirtualFile, DesktopItem } from '../../types';
import { downloadFileAndOpenGitHub } from '../../utils/fileDownload';

interface FileManagerAppProps {
  onOpenFileInNotepad?: (name: string, content: string) => void;
  targetFolderId?: string | null;
  onClearTargetFolder?: () => void;
  onLaunchApp?: (appId: string) => void;
  language?: 'ja' | 'en';
}

export const FileManagerApp: React.FC<FileManagerAppProps> = ({
  onOpenFileInNotepad,
  targetFolderId,
  onClearTargetFolder,
  onLaunchApp,
  language = 'ja',
}) => {
  const isJa = language === 'ja';
  const [currentFolder, setCurrentFolder] = useState<string>('Root');
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item?: any } | null>(null);

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Initialize and fetch virtual files and desktop items
  const fetchAllData = () => {
    try {
      // 1. Fetch Virtual Files
      const defaultVirtualFiles: VirtualFile[] = [
        {
          name: 'welcome.txt',
          path: 'Desktop',
          type: 'txt',
          content: 'Welcome to Abord OS!\n\nDouble click on Notepad, Paint, or any desktop icons to get started.\n\nAll your work is automatically saved so you can close this browser tab and return anytime.',
          createdAt: new Date().toISOString()
        },
        {
          name: 'features.txt',
          path: 'Documents',
          type: 'txt',
          content: 'Abord OS System Features:\n- Standard Windowed File Explorer\n- WeTalks Realtime Chat Messenger\n- Notepad, Word, Excel, Paint\n- Custom App Store & Installed Apps',
          createdAt: new Date().toISOString()
        }
      ];

      const storedFiles = localStorage.getItem('webos_files');
      let currentFiles: VirtualFile[] = [];
      if (storedFiles) {
        currentFiles = JSON.parse(storedFiles);
      }
      
      // Ensure default files exist if missing
      let missingDefault = false;
      defaultVirtualFiles.forEach(def => {
        if (!currentFiles.some(f => f.name.toLowerCase() === def.name.toLowerCase())) {
          currentFiles.push(def);
          missingDefault = true;
        }
      });
      if (missingDefault || !storedFiles) {
        localStorage.setItem('webos_files', JSON.stringify(currentFiles));
      }
      setFiles(currentFiles);

      // 2. Fetch Desktop Items
      const storedDesktop = localStorage.getItem('webos_desktop_items_v2');
      if (storedDesktop) {
        const parsedDesktop: DesktopItem[] = JSON.parse(storedDesktop);
        setDesktopItems(parsedDesktop.filter(i => !i.isDeleted));
      } else {
        setDesktopItems([]);
      }
    } catch (e) {
      console.error('Error fetching file manager data:', e);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleFsUpdate = () => fetchAllData();
    const handleDesktopUpdate = () => fetchAllData();

    window.addEventListener('webos_fs_updated', handleFsUpdate);
    window.addEventListener('webos_desktop_items_changed', handleDesktopUpdate);

    return () => {
      window.removeEventListener('webos_fs_updated', handleFsUpdate);
      window.removeEventListener('webos_desktop_items_changed', handleDesktopUpdate);
    };
  }, []);

  // Handle external folder target navigation when user double clicks desktop folder
  useEffect(() => {
    if (targetFolderId) {
      setCurrentFolder(targetFolderId);
      if (onClearTargetFolder) onClearTargetFolder();
    }
  }, [targetFolderId]);

  // Find custom folder details if currentFolder is a folder ID
  const activeDesktopFolder = desktopItems.find(item => item.type === 'folder' && item.id === currentFolder);

  // Get contents for current view folder
  const getFolderContents = () => {
    if (currentFolder === 'Root') {
      const desktopFolders = desktopItems
        .filter(item => item.type === 'folder' && !item.folderId)
        .map(folder => ({
          id: folder.id,
          name: folder.title,
          type: 'folder',
          isCustomFolder: true,
          count: desktopItems.filter(i => i.folderId === folder.id).length
        }));

      return [
        { id: 'Desktop', name: 'Desktop', type: 'folder', count: files.filter(f => f.path === 'Desktop').length + desktopItems.filter(i => !i.folderId).length },
        { id: 'Documents', name: 'Documents', type: 'folder', count: files.filter(f => f.path === 'Documents').length },
        { id: 'Pictures', name: 'Pictures', type: 'folder', count: files.filter(f => f.path === 'Pictures').length },
        ...desktopFolders
      ];
    }

    if (currentFolder === 'Desktop') {
      const virtualDesktopFiles = files.filter(f => f.path === 'Desktop').map(f => ({ ...f, itemType: 'virtual_file' }));
      const desktopAppsAndFiles = desktopItems
        .filter(i => !i.folderId)
        .map(item => ({
          id: item.id,
          name: item.title,
          type: item.type === 'folder' ? 'folder' : (item.type === 'app' ? 'app' : 'file'),
          appId: item.appId,
          icon: item.icon,
          itemType: 'desktop_item',
          rawItem: item
        }));

      // Deduplicate by name/title if file exists in both
      const combined = [...virtualDesktopFiles];
      desktopAppsAndFiles.forEach(dItem => {
        if (!combined.some(c => c.name.toLowerCase() === dItem.name.toLowerCase())) {
          combined.push(dItem as any);
        }
      });
      return combined;
    }

    if (currentFolder === 'Documents' || currentFolder === 'Pictures') {
      return files.filter(f => f.path === currentFolder).map(f => ({ ...f, itemType: 'virtual_file' }));
    }

    // Custom folder by ID or name
    const folderId = activeDesktopFolder ? activeDesktopFolder.id : currentFolder;
    const folderTitle = activeDesktopFolder ? activeDesktopFolder.title : currentFolder;

    const innerDesktopItems = desktopItems
      .filter(item => item.folderId === folderId)
      .map(item => ({
        id: item.id,
        name: item.title,
        type: item.type === 'folder' ? 'folder' : (item.type === 'app' ? 'app' : 'file'),
        appId: item.appId,
        icon: item.icon,
        itemType: 'desktop_item',
        rawItem: item
      }));

    const innerVirtualFiles = files
      .filter(f => f.path === folderId || f.path === folderTitle)
      .map(f => ({ ...f, itemType: 'virtual_file' }));

    return [...innerDesktopItems, ...innerVirtualFiles];
  };

  // Helper: check duplicate file name in current folder view
  const isDuplicateName = (nameToCheck: string, ignoreId?: string) => {
    const lower = nameToCheck.toLowerCase().trim();
    const contents = getFolderContents();
    return contents.some((item: any) => {
      if (ignoreId && (item.id === ignoreId || item.name === ignoreId)) return false;
      const itemName = (item.name || item.title || '').toLowerCase().trim();
      return itemName === lower;
    });
  };

  const handleDoubleClickItem = (item: any) => {
    if (item.type === 'folder') {
      setCurrentFolder(item.id || item.name);
      setSelectedItem(null);
    } else if (item.appId && onLaunchApp) {
      onLaunchApp(item.appId);
    } else if (item.type === 'txt' || item.type === 'file') {
      handleOpenFile(item);
    } else if (item.type === 'image') {
      setViewingImage(item.content);
    }
  };

  const handleOpenFile = (item: any) => {
    if (item.type === 'image' || item.content?.startsWith('data:image')) {
      setViewingImage(item.content);
      return;
    }
    const content = item.content || '';
    if (onOpenFileInNotepad) {
      onOpenFileInNotepad(item.name || item.title || 'Untitled.txt', content);
    } else {
      alert('Cannot launch Notepad directly.');
    }
  };

  const handleDownloadFile = (item: any) => {
    if (!item) return;
    const name = item.name || item.title || 'downloaded-file.txt';
    const content = item.content || '';
    const isImg = item.type === 'image' || content.startsWith('data:image');
    downloadFileAndOpenGitHub(name, content, isImg ? 'image/png' : 'text/plain;charset=utf-8');
  };

  const handleCreateNewTextFile = () => {
    const fileName = prompt(
      isJa ? '作成するテキストファイルの名前を入力してください:' : 'Enter file name for new text document:',
      'NewDocument.txt'
    );
    if (!fileName || !fileName.trim()) return;

    let cleanName = fileName.trim();
    if (!cleanName.endsWith('.txt')) cleanName += '.txt';

    if (isDuplicateName(cleanName)) {
      alert(isJa ? `「${cleanName}」という名前のファイルは同じ場所に既に存在します。` : `File "${cleanName}" already exists in this directory.`);
      return;
    }

    const newFile: VirtualFile = {
      name: cleanName,
      path: currentFolder === 'Root' ? 'Desktop' : currentFolder,
      type: 'txt',
      content: isJa ? 'ここにテキストを入力してください...' : 'Type text here...',
      createdAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('webos_files');
      const existing: VirtualFile[] = stored ? JSON.parse(stored) : [];
      const updated = [...existing, newFile];
      localStorage.setItem('webos_files', JSON.stringify(updated));
      setFiles(updated);
      window.dispatchEvent(new Event('webos_fs_updated'));
      if (onOpenFileInNotepad) {
        onOpenFileInNotepad(newFile.name, newFile.content);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    let finalName = uploaded.name;
    if (isDuplicateName(finalName)) {
      const dotIdx = finalName.lastIndexOf('.');
      const base = dotIdx !== -1 ? finalName.slice(0, dotIdx) : finalName;
      const ext = dotIdx !== -1 ? finalName.slice(dotIdx) : '';
      let counter = 1;
      while (isDuplicateName(`${base} (${counter})${ext}`)) {
        counter++;
      }
      finalName = `${base} (${counter})${ext}`;
    }

    const reader = new FileReader();
    const isImg = uploaded.type.startsWith('image/');

    reader.onload = () => {
      const content = reader.result as string;
      const newFile: VirtualFile = {
        name: finalName,
        path: currentFolder === 'Root' ? 'Desktop' : currentFolder,
        type: isImg ? 'image' : 'txt',
        content,
        createdAt: new Date().toISOString()
      };

      try {
        const stored = localStorage.getItem('webos_files');
        const existing: VirtualFile[] = stored ? JSON.parse(stored) : [];
        const updated = [...existing, newFile];
        localStorage.setItem('webos_files', JSON.stringify(updated));
        setFiles(updated);
        window.dispatchEvent(new Event('webos_fs_updated'));
      } catch(err) {
        console.error(err);
      }
    };

    if (isImg) reader.readAsDataURL(uploaded);
    else reader.readAsText(uploaded);
  };

  const handleRenameItem = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentName = item.name || item.title || '';
    const newName = prompt(
      isJa ? `「${currentName}」の新しい名前を入力してください:` : `Enter new name for "${currentName}":`,
      currentName
    );

    if (!newName || !newName.trim() || newName.trim() === currentName) return;

    const cleanNewName = newName.trim();

    if (isDuplicateName(cleanNewName, item.id || currentName)) {
      alert(isJa ? `「${cleanNewName}」という名前は既に使われています。` : `Name "${cleanNewName}" is already in use.`);
      return;
    }

    try {
      if (item.itemType === 'virtual_file' || item.content !== undefined) {
        const stored = localStorage.getItem('webos_files');
        const existing: VirtualFile[] = stored ? JSON.parse(stored) : [];
        const updated = existing.map(f => {
          if (f.name.toLowerCase() === currentName.toLowerCase() && f.path === item.path) {
            return { ...f, name: cleanNewName };
          }
          return f;
        });
        localStorage.setItem('webos_files', JSON.stringify(updated));
        setFiles(updated);
        window.dispatchEvent(new Event('webos_fs_updated'));
      } else if (item.itemType === 'desktop_item' || item.rawItem) {
        const stored = localStorage.getItem('webos_desktop_items_v2');
        const existing: DesktopItem[] = stored ? JSON.parse(stored) : [];
        const updated = existing.map(d => {
          if (d.id === item.id) {
            return { ...d, title: cleanNewName };
          }
          return d;
        });
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
        setDesktopItems(updated);
        window.dispatchEvent(new Event('webos_desktop_items_changed'));
      }
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isJa ? `「${item.name || item.title}」を削除しますか？` : `Delete "${item.name || item.title}"?`)) return;

    try {
      if (item.itemType === 'virtual_file' || item.content !== undefined) {
        const updatedFiles = files.filter(f => !(f.name.toLowerCase() === item.name.toLowerCase() && f.path === item.path));
        localStorage.setItem('webos_files', JSON.stringify(updatedFiles));
        setFiles(updatedFiles);
        window.dispatchEvent(new Event('webos_fs_updated'));
      } else if (item.itemType === 'desktop_item' || item.rawItem) {
        const updatedDesktop = desktopItems.filter(d => d.id !== item.id);
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updatedDesktop));
        setDesktopItems(updatedDesktop);
        window.dispatchEvent(new Event('webos_desktop_items_changed'));
      }
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToDesktop = (item: any) => {
    try {
      if (item.rawItem || item.itemType === 'desktop_item') {
        const stored = localStorage.getItem('webos_desktop_items_v2');
        const existing: DesktopItem[] = stored ? JSON.parse(stored) : [];
        const updated = existing.map(d => {
          if (d.id === item.id) {
            return { ...d, folderId: undefined };
          }
          return d;
        });
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
        setDesktopItems(updated);
        window.dispatchEvent(new Event('webos_desktop_items_changed'));
      } else if (item.itemType === 'virtual_file') {
        const stored = localStorage.getItem('webos_files');
        const existing: VirtualFile[] = stored ? JSON.parse(stored) : [];
        const updated = existing.map(f => {
          if (f.name.toLowerCase() === (item.name || '').toLowerCase()) {
            return { ...f, path: 'Desktop' };
          }
          return f;
        });
        localStorage.setItem('webos_files', JSON.stringify(updated));
        setFiles(updated);
        window.dispatchEvent(new Event('webos_fs_updated'));
      }
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (txt: string) => {
    if (!txt) return '0 B';
    const bytes = txt.length;
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const currentFolderDisplayName = activeDesktopFolder
    ? activeDesktopFolder.title
    : currentFolder === 'Root'
    ? 'This PC'
    : currentFolder;

  return (
    <div
      className="flex h-full bg-white text-gray-800 font-sans select-none relative"
      id="file-manager-app"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Sidebar Navigation */}
      <div className="w-48 bg-[#f3f4f6] border-r border-gray-200 p-2 flex flex-col justify-between shrink-0 hidden sm:flex">
        <div className="space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider">THIS PC</p>
          <button
            onClick={() => {
              setCurrentFolder('Root');
              setSelectedItem(null);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-left transition-colors ${
              currentFolder === 'Root' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <HardDrive className="w-4 h-4 text-gray-500" />
            <span>Virtual Storage (C:)</span>
          </button>
          <div className="pl-4 space-y-0.5 border-l border-gray-300 ml-5 mt-1.5">
            {['Desktop', 'Documents', 'Pictures'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setCurrentFolder(f);
                  setSelectedItem(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-left transition-colors ${
                  currentFolder === f ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>{f}</span>
              </button>
            ))}

            {/* Custom Desktop Folders */}
            {desktopItems.filter(i => i.type === 'folder').map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setCurrentFolder(folder.id);
                  setSelectedItem(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-left truncate transition-colors ${
                  currentFolder === folder.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{folder.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded-lg text-[10px] text-gray-500 space-y-1">
          <p className="font-bold text-gray-700">{isJa ? 'ストレージ使用量' : 'Storage Usage'}</p>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (files.reduce((acc, f) => acc + (f.content?.length || 0), 0) / 20000) * 100)}%` }}
            />
          </div>
          <p className="text-[9px]">
            {formatBytes(files.reduce((acc, f) => acc + (f.content || ''), ''))} of 20 KB
          </p>
        </div>
      </div>

      {/* Main File View Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-gray-200 bg-gray-50 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                if (currentFolder !== 'Root') {
                  setCurrentFolder('Root');
                  setSelectedItem(null);
                }
              }}
              disabled={currentFolder === 'Root'}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
              title={isJa ? '上の階層へ' : 'Go Up'}
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-gray-500 truncate font-medium">
              <span className="cursor-pointer hover:text-blue-600" onClick={() => setCurrentFolder('Root')}>This PC</span>
              {currentFolder !== 'Root' && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-800 truncate">{currentFolderDisplayName}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCreateNewTextFile}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1 text-[11px] shadow-xs"
              title={isJa ? '新規テキストファイルを作成' : 'New Text File'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isJa ? '新規ファイル' : 'New File'}</span>
            </button>

            <label className="px-2.5 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium flex items-center gap-1 text-[11px] cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-gray-600" />
              <span>{isJa ? 'ファイル追加' : 'Upload'}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>

            <button onClick={fetchAllData} className="p-1.5 rounded hover:bg-gray-200" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Directory Contents Grid */}
        <div
          className="flex-1 overflow-auto p-4 bg-white min-h-[200px]"
          id="file-grid-container"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }}
        >
          {getFolderContents().length === 0 ? (
            <div className="text-center py-16 text-gray-400 select-none">
              <Folder className="w-12 h-12 stroke-[1] text-gray-300 mx-auto mb-2.5" />
              <p className="text-sm font-medium">{isJa ? 'このフォルダは空です。' : 'This folder is empty.'}</p>
              <p className="text-xs mt-1">{isJa ? '「新規ファイル」や「ファイル追加」からデータを作成できます。' : 'You can create files or upload documents here.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {getFolderContents().map((item: any, i) => {
                const isSelected = selectedItem?.name === item.name || selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id || item.name || i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleDoubleClickItem(item);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedItem(item);
                      setContextMenu({ x: e.clientX, y: e.clientY, item });
                    }}
                    className={`flex flex-col items-center text-center p-3 rounded-lg border cursor-pointer select-none group transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                        : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {/* Icon */}
                    {item.type === 'folder' ? (
                      <AppIcon id="folder" size={44} className="mb-2" />
                    ) : item.type === 'app' || item.appId ? (
                      <AppIcon id={item.icon || item.appId || 'files'} size={44} className="mb-2" />
                    ) : item.type === 'txt' || item.type === 'file' ? (
                      <AppIcon id="doc-txt" size={44} className="mb-2" />
                    ) : item.type === 'image' || item.content?.startsWith('data:image') ? (
                      <div className="w-11 h-11 mb-2 bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                        <img src={item.content} alt={item.name} className="w-full h-full object-cover rounded-sm" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <AppIcon id="doc-txt" size={44} className="mb-2" />
                    )}

                    {/* Label */}
                    <span className="text-xs font-semibold truncate w-full text-gray-700 px-1">
                      {item.name || item.title}
                    </span>

                    {item.type === 'folder' && item.count !== undefined && (
                      <span className="text-[9px] text-gray-400 mt-0.5">
                        {item.count} {isJa ? '個' : 'items'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item Details Footer Bar */}
        <div className="bg-[#f3f4f6] border-t border-gray-200 p-2.5 px-4 text-xs text-gray-500 flex flex-wrap justify-between items-center gap-2 select-none">
          {selectedItem ? (
            <>
              <div className="flex items-center gap-2 truncate">
                {selectedItem.type === 'folder' ? (
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                ) : selectedItem.type === 'image' ? (
                  <Image className="w-4 h-4 text-purple-500 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span className="font-semibold text-gray-700 truncate">{selectedItem.name || selectedItem.title}</span>
                {selectedItem.content && (
                  <span className="text-[10px] text-gray-400">({formatBytes(selectedItem.content)})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(selectedItem.rawItem?.folderId || (selectedItem.path && selectedItem.path !== 'Desktop')) && (
                  <button
                    onClick={() => handleMoveToDesktop(selectedItem)}
                    className="p-1 text-amber-600 hover:bg-amber-100 rounded flex items-center gap-1 font-semibold"
                    title={isJa ? 'デスクトップに取り出す' : 'Move to Desktop'}
                  >
                    <Upload className="w-3.5 h-3.5 rotate-45 text-amber-600" />
                    <span className="text-[11px]">{isJa ? 'デスクトップへ移動' : 'Move to Desktop'}</span>
                  </button>
                )}
                {(selectedItem.type === 'txt' || selectedItem.type === 'file' || selectedItem.type === 'image' || selectedItem.content !== undefined) && (
                  <>
                    <button
                      onClick={() => handleOpenFile(selectedItem)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 font-medium"
                      title={isJa ? 'ファイルを開く' : 'Open File'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{isJa ? '開く' : 'Open'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile(selectedItem)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded flex items-center gap-1 font-semibold"
                      title={isJa ? 'PCへダウンロード（GitHubで開く）' : 'Download & Open in GitHub'}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px]">{isJa ? 'GitHubで開く / DL' : 'GitHub / DL'}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => handleRenameItem(selectedItem, e)}
                  className="p-1 text-amber-600 hover:bg-amber-50 rounded flex items-center gap-1 font-medium"
                  title={isJa ? '名前を変更' : 'Rename'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isJa ? '名前変更' : 'Rename'}</span>
                </button>
                <button
                  onClick={(e) => handleDeleteItem(selectedItem, e)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded flex items-center gap-1 font-medium"
                  title={isJa ? '削除' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isJa ? '削除' : 'Delete'}</span>
                </button>
              </div>
            </>
          ) : (
            <span className="text-gray-400 font-medium">
              {isJa ? 'アイテムを選択すると詳細が表示されます。' : 'Select an item to view options.'}
            </span>
          )}
        </div>
      </div>

      {/* Custom Right Click Context Menu */}
      {contextMenu && (
        <div
          style={{ position: 'fixed', left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl py-1 text-xs min-w-[150px] font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.item ? (
            <>
              <button
                onClick={() => {
                  setContextMenu(null);
                  handleDoubleClickItem(contextMenu.item);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>{isJa ? '開く' : 'Open'}</span>
              </button>
              {(contextMenu.item.content !== undefined || contextMenu.item.itemType === 'virtual_file') && (
                <button
                  onClick={() => {
                    setContextMenu(null);
                    handleDownloadFile(contextMenu.item);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-semibold"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isJa ? 'PCへダウンロード (GitHubで開く)' : 'Download & Open in GitHub'}</span>
                </button>
              )}
              {(contextMenu.item.rawItem?.folderId || (contextMenu.item.path && contextMenu.item.path !== 'Desktop')) && (
                <button
                  onClick={() => {
                    setContextMenu(null);
                    handleMoveToDesktop(contextMenu.item);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-amber-50 flex items-center gap-2 text-amber-700 font-semibold"
                >
                  <Upload className="w-3.5 h-3.5 rotate-45 text-amber-600" />
                  <span>{isJa ? 'デスクトップに取り出す' : 'Move to Desktop'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  setContextMenu(null);
                  handleRenameItem(contextMenu.item);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                <span>{isJa ? '名前の変更' : 'Rename'}</span>
              </button>
              <button
                onClick={(e) => {
                  setContextMenu(null);
                  handleDeleteItem(contextMenu.item, e);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isJa ? '削除' : 'Delete'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setContextMenu(null);
                  handleCreateNewTextFile();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                <span>{isJa ? '新規テキストファイル' : 'New File'}</span>
              </button>
              <button
                onClick={() => {
                  setContextMenu(null);
                  fetchAllData();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                <span>{isJa ? '最新の情報に更新' : 'Refresh'}</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9000] p-4" onClick={() => setViewingImage(null)}>
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between select-none">
              <span className="font-semibold text-xs text-gray-700">{isJa ? '画像プレビュー' : 'Image Preview'}</span>
              <button onClick={() => setViewingImage(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50 flex items-center justify-center max-h-[350px]">
              <img src={viewingImage} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded border shadow-xs" referrerPolicy="no-referrer" />
            </div>
            <div className="p-3 bg-gray-100 text-right">
              <button onClick={() => setViewingImage(null)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">
                {isJa ? '閉じる' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
