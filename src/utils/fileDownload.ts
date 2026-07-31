export const GITHUB_REPO_URL = 'https://github.com/moozunobu/Abord-browser-ver2';

/**
 * Downloads a file to the user's computer and immediately opens GitHub in a new browser tab.
 */
export function downloadFileAndOpenGitHub(
  fileName: string,
  content: string | Blob,
  mimeType: string = 'text/plain;charset=utf-8',
  githubUrl: string = GITHUB_REPO_URL
) {
  // 1. Create blob and download link
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  // 2. Open GitHub immediately in a new tab
  try {
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  } catch (e) {
    console.error('Failed to open GitHub in browser:', e);
  }
}
