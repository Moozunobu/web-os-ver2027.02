import React, { useState, useEffect } from 'react';
import { AppIcon } from './AppIcon';
import { DesktopItem } from '../types';
import { Folder, Plus, ArrowUpRight, Trash2, Edit2, X, Sparkles, MoveRight, ExternalLink, Play } from 'lucide-react';
import { findAvailableGridSpot } from '../utils/grid';

interface FolderViewWindowProps {
  folder: DesktopItem;
  allItems: DesktopItem[];
  onUpdateItems: (newItems: DesktopItem[]) => void;
  onLaunchApp: (appId: string, item?: DesktopItem) => void;
  onClose: () => void;
  language?: 'ja' | 'en';
}

export const FolderViewWindow: React.FC<FolderViewWindowProps> = ({
  folder,
  allItems,
  onUpdateItems,
  onLaunchApp,
  onClose,
  language = 'ja',
}) => {
  const isJa = language === 'ja';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [folderTitle, setFolderTitle] = useState(folder.title);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: DesktopItem } | null>(null);

  // Close context menu on window click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Items currently inside this folder
  const folderContents = allItems.filter(
    (item) => item.folderId === folder.id && !item.isDeleted
  );

  // Available desktop items that can be moved into this folder
  const availableDesktopApps = allItems.filter(
    (item) => !item.folderId && !item.isDeleted && item.id !== folder.id && item.type !== 'recycle'
  );

  // Handle title rename
  const handleRenameSubmit = () => {
    setIsEditingTitle(false);
    if (folderTitle.trim() && folderTitle.trim() !== folder.title) {
      const updated = allItems.map((item) =>
        item.id === folder.id ? { ...item, title: folderTitle.trim() } : item
      );
      onUpdateItems(updated);
    } else {
      setFolderTitle(folder.title);
    }
  };

  // Move single item out of folder back to desktop
  const handleMoveToDesktop = (itemId: string) => {
    const spot = findAvailableGridSpot(allItems, itemId);
    const updated = allItems.map((item) =>
      item.id === itemId ? { ...item, folderId: undefined, x: spot.x, y: spot.y } : item
    );
    onUpdateItems(updated);
  };

  // Move ALL items out of folder back to desktop
  const handleMoveAllToDesktop = () => {
    if (folderContents.length === 0) return;
    let tempItems = [...allItems];
    folderContents.forEach((innerItem) => {
      const spot = findAvailableGridSpot(tempItems, innerItem.id);
      tempItems = tempItems.map((item) =>
        item.id === innerItem.id ? { ...item, folderId: undefined, x: spot.x, y: spot.y } : item
      );
    });
    onUpdateItems(tempItems);
  };

  // Move item into folder
  const handleAddAppToFolder = (itemId: string) => {
    const updated = allItems.map((item) =>
      item.id === itemId ? { ...item, folderId: folder.id } : item
    );
    onUpdateItems(updated);
  };

  // Delete single item from folder
  const handleDeleteItem = (itemId: string) => {
    const updated = allItems.map((item) =>
      item.id === itemId ? { ...item, isDeleted: true } : item
    );
    onUpdateItems(updated);
  };

  // Delete entire folder
  const handleDeleteFolder = () => {
    if (
      confirm(
        isJa
          ? `フォルダ「${folder.title}」を削除しますか？（中のアプリはデスクトップに戻ります）`
          : `Delete folder "${folder.title}"? (Items inside will return to Desktop)`
      )
    ) {
      // Move all inner items back to desktop
      let tempItems = [...allItems];
      folderContents.forEach((innerItem) => {
        const spot = findAvailableGridSpot(tempItems, innerItem.id);
        tempItems = tempItems.map((item) =>
          item.id === innerItem.id ? { ...item, folderId: undefined, x: spot.x, y: spot.y } : item
        );
      });
      // Mark folder as deleted or remove
      const updated = tempItems.filter((item) => item.id !== folder.id);
      onUpdateItems(updated);
      onClose();
    }
  };

  return (
    <div 
      onContextMenu={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[7000] flex items-center justify-center pointer-events-none p-4 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="pointer-events-auto w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Folder className="w-6 h-6 fill-amber-400/30" />
            </div>

            {isEditingTitle ? (
              <input
                type="text"
                value={folderTitle}
                onChange={(e) => setFolderTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setFolderTitle(folder.title);
                  }
                }}
                autoFocus
                className="bg-slate-950 border border-blue-500 rounded px-2 py-1 text-base font-bold text-white focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-lg font-bold text-white tracking-tight">{folder.title}</h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title={isJa ? '名前を変更' : 'Rename'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 font-medium border border-slate-600/50">
              {folderContents.length} {isJa ? '個のアイテム' : 'items'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Extract All Button */}
            {folderContents.length > 0 && (
              <button
                onClick={handleMoveAllToDesktop}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title={isJa ? 'フォルダ内のすべてのアイテムをデスクトップに戻します' : 'Move all items back to desktop'}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{isJa ? '全て取り出す' : 'Extract All'}</span>
              </button>
            )}

            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isJa ? 'アプリを追加' : 'Add App'}</span>
            </button>

            <button
              onClick={handleDeleteFolder}
              className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              title={isJa ? 'フォルダを削除' : 'Delete Folder'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[280px]">
          {folderContents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-slate-700/60 rounded-xl bg-slate-800/30">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Folder className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {isJa ? 'このフォルダは空です' : 'This folder is empty'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
                {isJa
                  ? '上の「アプリを追加」ボタンからアプリを移動できます。取り出したいときは各カードの「取り出す」ボタンを押します。'
                  : 'Click "Add App" above to add apps here. Click "Extract" on any item to move it back to desktop.'}
              </p>
              <button
                onClick={() => setShowAddAppModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>{isJa ? 'アプリを選択して追加' : 'Select Apps to Add'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {folderContents.map((item) => (
                <div
                  key={item.id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY, item });
                  }}
                  className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/60 rounded-xl p-3 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Top Right Quick Extract Button (Always visible) */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToDesktop(item.id);
                      }}
                      className="p-1 rounded-md bg-slate-900/90 hover:bg-amber-600 text-amber-300 hover:text-white transition-colors border border-slate-700 shadow-sm"
                      title={isJa ? 'デスクトップに取り出す' : 'Extract to Desktop'}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    onClick={() => {
                      if (item.appId) onLaunchApp(item.appId, item);
                      onClose();
                    }}
                    className="w-14 h-14 mb-2 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
                  >
                    <AppIcon id={item.icon} size={48} />
                  </div>

                  {/* Title */}
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate w-full px-1">
                    {item.title}
                  </span>

                  {/* Action Buttons: Launch and Extract */}
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 w-full">
                    <button
                      onClick={() => {
                        if (item.appId) onLaunchApp(item.appId, item);
                        onClose();
                      }}
                      className="py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>{isJa ? '起動' : 'Launch'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToDesktop(item.id);
                      }}
                      className="py-1 rounded-lg bg-slate-700 hover:bg-amber-600 text-amber-200 hover:text-white text-[10px] font-bold transition-all flex items-center justify-center gap-0.5 active:scale-95"
                      title={isJa ? 'デスクトップに取り出す' : 'Move to Desktop'}
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{isJa ? '取り出す' : 'Extract'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-amber-200/90 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isJa
                ? '「取り出す」ボタンでフォルダからデスクトップへ移動できます。'
                : 'Click "Extract" to move items back onto the desktop.'}
            </span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-semibold underline underline-offset-2"
          >
            {isJa ? '閉じる' : 'Close'}
          </button>
        </div>
      </div>

      {/* Item Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 9999,
          }}
          className="pointer-events-auto bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 py-1.5 min-w-[170px] text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const item = contextMenu.item;
              setContextMenu(null);
              if (item.appId) onLaunchApp(item.appId, item);
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-white"
          >
            <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span>{isJa ? 'アプリを起動' : 'Launch App'}</span>
          </button>

          <button
            onClick={() => {
              const item = contextMenu.item;
              setContextMenu(null);
              handleMoveToDesktop(item.id);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-amber-300 font-bold"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>{isJa ? 'デスクトップに取り出す' : 'Move out to Desktop'}</span>
          </button>

          <div className="h-[1px] bg-slate-800 my-1" />

          <button
            onClick={() => {
              const item = contextMenu.item;
              setContextMenu(null);
              handleDeleteItem(item.id);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isJa ? 'ごみ箱へ移動' : 'Move to Trash'}</span>
          </button>
        </div>
      )}

      {/* Add App Modal */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>{isJa ? 'フォルダに追加するアプリを選択' : 'Select Apps to Add'}</span>
              </h3>
              <button
                onClick={() => setShowAddAppModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {availableDesktopApps.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                {isJa
                  ? 'デスクトップに追加可能なアプリがありません。'
                  : 'No apps currently available on Desktop to move.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableDesktopApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <AppIcon id={app.icon} size={28} />
                      </div>
                      <span className="text-xs font-semibold text-white">{app.title}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleAddAppToFolder(app.id);
                        setShowAddAppModal(false);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>{isJa ? '移動' : 'Move'}</span>
                      <MoveRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

