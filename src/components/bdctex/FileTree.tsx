import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  Image,
  Trash2,
  Plus,
  Edit2,
  ChevronDown,
  ChevronRight,
  FilePlus,
  FolderPlus,
  Upload
} from "lucide-react";
import type { LatexFile } from "@/types";

interface FileTreeProps {
  files: LatexFile[];
  activeFile: LatexFile | null;
  onSelect: (file: LatexFile) => void;
  onDelete?: (id: number) => void;
  onRename?: (id: number, newName: string) => void;
  onCreateFile?: (filename: string, content?: string) => void;
  onCreateFolder?: (folderPath: string) => void;
  onUploadClick?: () => void;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  file?: LatexFile;
  children: { [key: string]: TreeNode };
}

export function FileTree({
  files,
  activeFile,
  onSelect,
  onDelete,
  onRename,
  onCreateFile,
  onCreateFolder,
  onUploadClick,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set<string>());
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  // Auto-expand all folders on mount or when files list changes
  useEffect(() => {
    if (files.length > 0) {
      const folders = new Set<string>();
      files.forEach((file) => {
        const parts = file.filename.split("/");
        for (let i = 1; i < parts.length; i++) {
          folders.add(parts.slice(0, i).join("/"));
        }
      });
      setExpandedFolders(folders);
    }
  }, [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp", "eps"].includes(ext || "")) {
      return <Image size={15} className="text-emerald-500 shrink-0" />;
    }
    return <FileText size={15} className="text-blue-500 shrink-0" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Build hierarchical tree
  const buildTree = (filesList: LatexFile[]) => {
    const root: TreeNode = { name: "", path: "", isFolder: true, children: {} };
    filesList.forEach((file) => {
      const parts = file.filename.split("/");
      let current = root;
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const fullPath = parts.slice(0, index + 1).join("/");
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: fullPath,
            isFolder: !isLast,
            children: {},
            file: isLast ? file : undefined,
          };
        }
        current = current.children[part];
      });
    });
    return root;
  };

  const rootNode = buildTree(files);

  const startRename = (file: LatexFile) => {
    const parts = file.filename.split("/");
    const leafName = parts[parts.length - 1];
    setEditingFileId(file.id);
    setEditName(leafName);
  };

  const handleRenameSubmit = (file: LatexFile) => {
    if (!editName.trim()) {
      setEditingFileId(null);
      return;
    }
    const parts = file.filename.split("/");
    const oldLeafName = parts[parts.length - 1];
    if (editName.trim() === oldLeafName) {
      setEditingFileId(null);
      return;
    }
    parts[parts.length - 1] = editName.trim();
    const newFilename = parts.join("/");
    if (onRename) {
      onRename(file.id, newFilename);
    }
    setEditingFileId(null);
  };

  const handleNewFileClick = (parentPath?: string) => {
    let msg = "Nhập tên tệp tin mới (ví dụ: document.tex):";
    if (parentPath) {
      msg = `Nhập tên tệp tin mới trong thư mục "${parentPath}" (ví dụ: document.tex):`;
    }
    const filename = prompt(msg);
    if (!filename) return;
    let name = filename.trim();
    if (!name) return;

    if (parentPath) {
      name = `${parentPath}/${name}`;
    }

    if (files.some((f) => f.filename === name)) {
      alert("Tệp tin đã tồn tại!");
      return;
    }

    if (onCreateFile) {
      onCreateFile(name, "");
    }
  };

  const handleNewFolderClick = (parentPath?: string) => {
    let msg = "Nhập tên thư mục mới (ví dụ: images):";
    if (parentPath) {
      msg = `Nhập tên thư mục mới trong thư mục "${parentPath}" (ví dụ: images):`;
    }
    const foldername = prompt(msg);
    if (!foldername) return;
    let name = foldername.trim();
    if (!name) return;

    name = name.replace(/^\/|\/$/g, "");

    if (parentPath) {
      name = `${parentPath}/${name}`;
    }

    const folderExists = files.some(
      (f) => f.filename.startsWith(name + "/") || f.filename === name + "/.keep"
    );
    if (folderExists) {
      alert("Thư mục đã tồn tại!");
      return;
    }

    if (onCreateFolder) {
      onCreateFolder(name);
      // Auto expand newly created folder
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        next.add(name);
        return next;
      });
    }
  };

  const handleDropOnFolder = (dragData: any, targetFolder: string) => {
    if (!onRename) return;

    if (dragData.type === "file") {
      const { id, filename } = dragData;
      const parts = filename.split("/");
      const baseName = parts[parts.length - 1];

      // New path
      const newFilename = targetFolder ? `${targetFolder}/${baseName}` : baseName;
      if (newFilename === filename) return;

      if (files.some((f) => f.filename === newFilename)) {
        alert(`Tệp tin "${baseName}" đã tồn tại ở vị trí đích!`);
        return;
      }

      onRename(id, newFilename);
    } else if (dragData.type === "folder") {
      const sourceFolder = dragData.path;
      if (targetFolder === sourceFolder) return;
      if (targetFolder.startsWith(sourceFolder + "/")) {
        alert("Không thể di chuyển thư mục cha vào thư mục con!");
        return;
      }

      const sourceParts = sourceFolder.split("/");
      const folderBaseName = sourceParts[sourceParts.length - 1];
      const newFolderPath = targetFolder ? `${targetFolder}/${folderBaseName}` : folderBaseName;

      const prefix = sourceFolder + "/";
      const filesToMove = files.filter(
        (f) => f.filename.startsWith(prefix) || f.filename === sourceFolder + "/.keep"
      );

      if (filesToMove.length === 0) return;

      let hasDuplicate = false;
      filesToMove.forEach((f) => {
        const relativePath = f.filename.slice(sourceFolder.length);
        const targetFilename = newFolderPath + relativePath;
        if (files.some((ef) => ef.filename === targetFilename)) {
          hasDuplicate = true;
        }
      });

      if (hasDuplicate) {
        alert(`Không thể di chuyển vì một số tệp trong thư mục "${folderBaseName}" đã tồn tại ở đích!`);
        return;
      }

      // Perform moves
      filesToMove.forEach((f) => {
        const relativePath = f.filename.slice(sourceFolder.length);
        const newFilename = newFolderPath + relativePath;
        onRename(f.id, newFilename);
      });
    }
  };

  // Recursive tree renderer
  const renderTree = (node: TreeNode, depth: number = 0) => {
    const sortedChildren = Object.values(node.children)
      .filter((child) => child.name !== ".keep")
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });

    return sortedChildren.map((child) => {
      const isExpanded = expandedFolders.has(child.path);
      const isFolder = child.isFolder;

      if (isFolder) {
        return (
          <div key={child.path} className="flex flex-col">
            <div
              onClick={() => toggleFolder(child.path)}
              draggable={!!onRename}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify({ type: "folder", path: child.path })
                );
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add("bg-blue-50/80", "dark:bg-blue-950/30");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove("bg-blue-50/80", "dark:bg-blue-950/30");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove("bg-blue-50/80", "dark:bg-blue-950/30");
                try {
                  const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                  handleDropOnFolder(data, child.path);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none transition-colors duration-150"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                {isExpanded ? (
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400 shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen size={15} className="text-amber-500 shrink-0" />
                ) : (
                  <Folder size={15} className="text-amber-500 shrink-0" />
                )}
                <span className="text-sm truncate font-medium text-slate-800 dark:text-slate-200">
                  {child.name}
                </span>
              </div>

              {/* Action buttons for folder hover */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {onCreateFile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewFileClick(child.path);
                    }}
                    className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-150"
                    title="Tạo tệp trong thư mục này"
                  >
                    <FilePlus size={13} />
                  </button>
                )}
                {onCreateFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewFolderClick(child.path);
                    }}
                    className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-150"
                    title="Tạo thư mục con"
                  >
                    <FolderPlus size={13} />
                  </button>
                )}
              </div>
            </div>
            {isExpanded && renderTree(child, depth + 1)}
          </div>
        );
      } else {
        const file = child.file!;
        const isActive = activeFile?.id === file.id;
        const isEditing = editingFileId === file.id;

        return (
          <div
            key={file.id}
            onClick={() => !isEditing && onSelect(file)}
            draggable={!isEditing && !!onRename}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "text/plain",
                JSON.stringify({ type: "file", id: file.id, filename: file.filename })
              );
              e.dataTransfer.effectAllowed = "move";
            }}
            className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 select-none ${
              isActive
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
            style={{ paddingLeft: `${depth * 12 + 24}px` }}
          >
            <div className="flex items-center gap-2 overflow-hidden w-full">
              {getFileIcon(file.filename)}
              <div className="overflow-hidden w-full">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameSubmit(file);
                      } else if (e.key === "Escape") {
                        setEditingFileId(null);
                      }
                    }}
                    onBlur={() => handleRenameSubmit(file)}
                    className="bg-white dark:bg-slate-800 border border-blue-500 dark:border-blue-400 rounded px-1.5 py-0.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="text-sm truncate block" title={child.name}>
                      {child.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {formatSize(file.file_size)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons (rename & delete) */}
            {!isEditing && (
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {onRename && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(file);
                    }}
                    className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-150"
                    title="Đổi tên"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Bạn có chắc chắn muốn xóa tệp "${child.name}"?`)) {
                        onDelete(file.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-150"
                    title="Xóa tệp"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 flex flex-col h-full select-none">
      {/* Header with multiple action buttons */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Tài liệu dự án
        </h4>
        <div className="flex items-center gap-1">
          {onCreateFile && (
            <button
              onClick={() => handleNewFileClick()}
              className="text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 active:scale-95 transition-all duration-200"
              title="Tạo tệp mới"
            >
              <FilePlus size={15} />
            </button>
          )}
          {onCreateFolder && (
            <button
              onClick={() => handleNewFolderClick()}
              className="text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 active:scale-95 transition-all duration-200"
              title="Tạo thư mục mới"
            >
              <FolderPlus size={15} />
            </button>
          )}
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg active:scale-95 transition-all duration-200"
              title="Tải lên file / ZIP"
            >
              <Upload size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Files List containing Drop zone for root level */}
      <div
        className={`flex-1 overflow-y-auto p-2 space-y-1 transition-colors duration-200 ${
          isDragOverRoot ? "bg-slate-50 dark:bg-slate-800/35 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg m-1" : ""
        }`}
        onDragOver={(e) => {
          if (!onRename) return;
          e.preventDefault();
          setIsDragOverRoot(true);
        }}
        onDragLeave={() => {
          setIsDragOverRoot(false);
        }}
        onDrop={(e) => {
          if (!onRename) return;
          e.preventDefault();
          setIsDragOverRoot(false);
          try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            handleDropOnFolder(data, "");
          } catch (err) {
            console.error("Drop error:", err);
          }
        }}
      >
        {files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">Không có tệp nào.</p>
          </div>
        ) : (
          renderTree(rootNode)
        )}
      </div>
    </div>
  );
}
