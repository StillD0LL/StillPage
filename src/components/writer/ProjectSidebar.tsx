import React, { useState } from 'react';
import {
  FolderPlus,
  FilePlus,
  UserPlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Star,
  GripVertical,
  Layers,
  Sparkles,
  Settings2,
  FolderTree,
  FolderInput,
  CornerDownRight,
  Check,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  WritingProject,
  WritingFolder,
  WritingDocument,
  WritingDocType,
  CharacterProfile,
} from '../../types';

interface ProjectSidebarProps {
  projects: WritingProject[];
  folders: WritingFolder[];
  documents: WritingDocument[];
  activeProjectId: string;
  activeDocumentId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectDocument: (docId: string) => void;
  onCreateProject: (name: string, description?: string, icon?: string, color?: string) => void;
  onUpdateProject: (id: string, updates: Partial<WritingProject>) => void;
  onDeleteProject: (id: string) => void;
  onCreateFolder: (projectId: string, name: string, parentId?: string | null) => void;
  onUpdateFolder: (id: string, updates: Partial<WritingFolder>) => void;
  onDeleteFolder: (id: string, deleteContents?: boolean) => void;
  onCreateDocument: (
    projectId: string,
    folderId?: string | null,
    title?: string,
    docType?: WritingDocType,
    initialCharacterData?: CharacterProfile
  ) => void;
  onUpdateDocument: (id: string, updates: Partial<WritingDocument>) => void;
  onDeleteDocument: (id: string) => void;
  onDuplicateDocument: (id: string) => void;
  onReorderDocuments: (docs: WritingDocument[]) => void;
  onReorderFolders: (folders: WritingFolder[]) => void;
  onMoveDocumentToFolder: (docId: string, folderId: string | null) => void;
  onOpenSettings?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  folders,
  documents,
  activeProjectId,
  activeDocumentId,
  onSelectProject,
  onSelectDocument,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateDocument,
  onUpdateDocument,
  onDeleteDocument,
  onDuplicateDocument,
  onReorderDocuments,
  onReorderFolders,
  onMoveDocumentToFolder,
  onOpenSettings,
  isCollapsed = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('📁');
  const [newProjectColor, setNewProjectColor] = useState('#6366f1');

  // Folder creation & nesting state
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [targetFolderParentId, setTargetFolderParentId] = useState<string | null>(null);

  // In-App Modals for reliable operation in iframe sandbox
  const [folderToMove, setFolderToMove] = useState<WritingFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<WritingFolder | null>(null);
  const [folderDeleteMode, setFolderDeleteMode] = useState<'safe' | 'recursive'>('safe');
  const [folderToRename, setFolderToRename] = useState<WritingFolder | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<WritingProject | null>(null);
  const [docToDelete, setDocToDelete] = useState<WritingDocument | null>(null);

  // Folder expansion state
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    folders.forEach((f) => {
      initial[f.id] = f.isExpanded ?? true;
    });
    return initial;
  });

  // Drag and Drop tracking
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>(null);
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const projectFolders = folders.filter((f) => f.projectId === activeProjectId);
  const projectDocs = documents.filter((d) => d.projectId === activeProjectId);

  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Helper: Check if folderB is a descendant of folderA (to prevent circular nesting)
  const isDescendant = (candidateDescendantId: string, potentialAncestorId: string): boolean => {
    if (candidateDescendantId === potentialAncestorId) return true;
    let curr = projectFolders.find((f) => f.id === candidateDescendantId);
    const visited = new Set<string>();
    while (curr && curr.parentId) {
      if (visited.has(curr.id)) break; // cycle safety
      visited.add(curr.id);
      if (curr.parentId === potentialAncestorId) return true;
      curr = projectFolders.find((f) => f.id === curr!.parentId);
    }
    return false;
  };

  // Helper: Get full hierarchical path of a folder
  const getFolderBreadcrumbPath = (folderId: string): string => {
    const parts: string[] = [];
    let curr = projectFolders.find((f) => f.id === folderId);
    const visited = new Set<string>();
    while (curr) {
      if (visited.has(curr.id)) break;
      visited.add(curr.id);
      parts.unshift(curr.name);
      curr = curr.parentId ? projectFolders.find((f) => f.id === curr!.parentId) : undefined;
    }
    return parts.join(' / ');
  };

  // Helper: Count direct and nested documents in a folder
  const countDocsInFolder = (folderId: string, includeNested: boolean = true): number => {
    const direct = projectDocs.filter((d) => d.folderId === folderId).length;
    if (!includeNested) return direct;
    const subfolders = projectFolders.filter((f) => f.parentId === folderId);
    const nested = subfolders.reduce((acc, sub) => acc + countDocsInFolder(sub.id, true), 0);
    return direct + nested;
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim(), '', newProjectIcon, newProjectColor);
    setNewProjectName('');
    setShowNewProjectModal(false);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(activeProjectId, newFolderName.trim(), targetFolderParentId);
    if (targetFolderParentId) {
      setExpandedFolderIds((prev) => ({ ...prev, [targetFolderParentId]: true }));
    }
    setNewFolderName('');
    setIsCreatingFolder(false);
    setTargetFolderParentId(null);
  };

  // Drag handlers for Documents
  const handleDocDragStart = (e: React.DragEvent, docId: string) => {
    setDraggedDocId(docId);
    setDraggedFolderId(null);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'doc', id: docId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDocDrop = (e: React.DragEvent, targetDocId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedDocId || draggedDocId === targetDocId) {
      setDraggedDocId(null);
      setDragOverDocId(null);
      return;
    }

    const sourceDoc = documents.find((d) => d.id === draggedDocId);
    const targetDoc = documents.find((d) => d.id === targetDocId);
    if (!sourceDoc || !targetDoc) return;

    const targetFolderId = targetDoc.folderId || null;
    const sameFolderDocs = projectDocs.filter((d) => (d.folderId || null) === targetFolderId);
    const otherDocs = documents.filter((d) => !sameFolderDocs.some((sd) => sd.id === d.id));

    const sourceIdx = sameFolderDocs.findIndex((d) => d.id === draggedDocId);
    const targetIdx = sameFolderDocs.findIndex((d) => d.id === targetDocId);

    const reorderedInFolder = [...sameFolderDocs];
    if (sourceIdx !== -1) {
      const [moved] = reorderedInFolder.splice(sourceIdx, 1);
      moved.folderId = targetFolderId;
      reorderedInFolder.splice(targetIdx, 0, moved);
    } else {
      sourceDoc.folderId = targetFolderId;
      reorderedInFolder.splice(targetIdx, 0, sourceDoc);
    }

    const finalDocs = [...otherDocs, ...reorderedInFolder.map((d, i) => ({ ...d, order: i }))];
    onReorderDocuments(finalDocs);
    setDraggedDocId(null);
    setDragOverDocId(null);
  };

  // Drag handlers for Folders
  const handleFolderDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolderId(folderId);
    setDraggedDocId(null);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'folder', id: folderId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drop on a Folder container (nesting folder or moving document)
  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Moving a Document into target folder or root
    if (draggedDocId) {
      onMoveDocumentToFolder(draggedDocId, targetFolderId);
      if (targetFolderId) {
        setExpandedFolderIds((prev) => ({ ...prev, [targetFolderId]: true }));
      }
    }
    // 2. Nesting or Unnesting a Folder
    else if (draggedFolderId) {
      // Unnesting to root level
      if (targetFolderId === null) {
        onUpdateFolder(draggedFolderId, { parentId: null });
      }
      // Nesting inside another folder
      else if (targetFolderId !== draggedFolderId && !isDescendant(targetFolderId, draggedFolderId)) {
        onUpdateFolder(draggedFolderId, { parentId: targetFolderId });
        setExpandedFolderIds((prev) => ({ ...prev, [targetFolderId]: true }));
      }
    }

    setDraggedDocId(null);
    setDraggedFolderId(null);
    setDragOverFolderId(null);
  };

  // Filter documents by search
  const filteredDocs = projectDocs.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Check if a folder or any of its children match search query
  const doesFolderMatchSearch = (folder: WritingFolder): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (folder.name.toLowerCase().includes(q)) return true;
    // Check direct docs
    if (filteredDocs.some((d) => d.folderId === folder.id)) return true;
    // Check child subfolders
    const childFolders = projectFolders.filter((f) => f.parentId === folder.id);
    return childFolders.some((child) => doesFolderMatchSearch(child));
  };

  // Root level items
  const rootFolders = projectFolders.filter(
    (f) => !f.parentId || !projectFolders.some((parent) => parent.id === f.parentId)
  );
  const rootDocs = filteredDocs.filter((d) => !d.folderId);

  const getStatusBadge = (status?: WritingDocument['status']) => {
    switch (status) {
      case 'completed':
        return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Completed" />;
      case 'in-progress':
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="In Progress" />;
      case 'review':
        return <span className="w-1.5 h-1.5 rounded-full bg-sky-400" title="In Review" />;
      case 'archived':
        return <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" title="Archived" />;
      default:
        return null;
    }
  };

  // Target parent folder object if creating a subfolder
  const targetParentFolder = targetFolderParentId
    ? projectFolders.find((f) => f.id === targetFolderParentId)
    : null;

  // Recursive Renderer for Folder Node
  const renderFolderItem = (folder: WritingFolder, depth: number = 0) => {
    if (!doesFolderMatchSearch(folder)) return null;

    const isExpanded = (expandedFolderIds[folder.id] ?? true) || Boolean(searchQuery.trim());
    const folderDocs = filteredDocs.filter((d) => d.folderId === folder.id);
    const subfolders = projectFolders.filter((f) => f.parentId === folder.id);
    const isDragOver = dragOverFolderId === folder.id;
    const isBeingDragged = draggedFolderId === folder.id;

    // Check if dragging another folder over this folder is valid
    const isInvalidDropTarget =
      draggedFolderId && (draggedFolderId === folder.id || isDescendant(folder.id, draggedFolderId));

    const totalDocCount = countDocsInFolder(folder.id, true);

    return (
      <div
        key={folder.id}
        className={`rounded-xl transition-all ${
          isBeingDragged
            ? 'opacity-40 border border-dashed border-zinc-600'
            : isDragOver && !isInvalidDropTarget
            ? 'bg-amber-500/15 ring-2 ring-amber-500/80 shadow-md'
            : isDragOver && isInvalidDropTarget
            ? 'bg-rose-500/10 ring-1 ring-rose-500/40'
            : 'bg-transparent'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isInvalidDropTarget) {
            setDragOverFolderId(folder.id);
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (dragOverFolderId === folder.id) {
            setDragOverFolderId(null);
          }
        }}
        onDrop={(e) => {
          if (!isInvalidDropTarget) {
            handleFolderDrop(e, folder.id);
          }
        }}
      >
        {/* Folder Row */}
        <div
          draggable
          onDragStart={(e) => handleFolderDragStart(e, folder.id)}
          className={`group/folder flex items-center justify-between p-1.5 px-2 rounded-lg hover:bg-zinc-800/70 text-zinc-300 hover:text-white cursor-pointer transition-all text-xs font-medium select-none ${
            depth > 0 ? 'bg-zinc-900/30' : ''
          }`}
          onClick={() => toggleFolder(folder.id)}
          title={`Folder: ${getFolderBreadcrumbPath(folder.id)} (Drag onto another folder to nest, or drag files here)`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Indent Guide Marker for Nested Folders */}
            {depth > 0 && (
              <span className="text-zinc-600 text-[10px] shrink-0 font-mono select-none mr-0.5">
                └
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            <span className={depth === 0 ? 'text-amber-400' : 'text-amber-300'}>
              {isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5" />
              ) : (
                <Folder className="w-3.5 h-3.5" />
              )}
            </span>

            <span className="truncate font-semibold text-zinc-200">{folder.name}</span>

            {/* Depth Badge if deeply nested */}
            {depth > 1 && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                L{depth}
              </span>
            )}

            {/* Subfolders + Document Count Indicator */}
            <span className="text-[10px] text-zinc-500 font-normal ml-auto mr-1 flex items-center gap-1">
              {subfolders.length > 0 && (
                <span title={`${subfolders.length} nested subfolder${subfolders.length > 1 ? 's' : ''}`}>
                  {subfolders.length}📁
                </span>
              )}
              <span title={`${totalDocCount} total document${totalDocCount !== 1 ? 's' : ''}`}>
                {folderDocs.length}
                {subfolders.length > 0 ? ` (${totalDocCount})` : ''}
              </span>
            </span>
          </div>

          {/* Folder Action Icons */}
          <div className="opacity-0 group-hover/folder:opacity-100 flex items-center gap-0.5 transition-opacity">
            {/* Quick Add Note inside folder */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateDocument(activeProjectId, folder.id, 'Untitled Document.md', 'document');
                setExpandedFolderIds((prev) => ({ ...prev, [folder.id]: true }));
              }}
              className="p-1 text-zinc-400 hover:text-indigo-300 rounded hover:bg-zinc-700"
              title="Add document inside this folder"
            >
              <FilePlus className="w-3 h-3" />
            </button>

            {/* Quick Add Character Wiki inside folder */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateDocument(activeProjectId, folder.id, 'New Character', 'character');
                setExpandedFolderIds((prev) => ({ ...prev, [folder.id]: true }));
              }}
              className="p-1 text-zinc-400 hover:text-purple-300 rounded hover:bg-zinc-700"
              title="Add character wiki page inside this folder"
            >
              <UserPlus className="w-3 h-3" />
            </button>

            {/* Quick Add Subfolder inside folder */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTargetFolderParentId(folder.id);
                setIsCreatingFolder(true);
                setExpandedFolderIds((prev) => ({ ...prev, [folder.id]: true }));
              }}
              className="p-1 text-zinc-400 hover:text-amber-400 rounded hover:bg-zinc-700"
              title="Add nested subfolder inside this folder"
            >
              <FolderPlus className="w-3 h-3" />
            </button>

            {/* Move / Nest Folder Dialog Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFolderToMove(folder);
              }}
              className="p-1 text-zinc-400 hover:text-sky-300 rounded hover:bg-zinc-700"
              title="Move / Nest this folder"
            >
              <FolderInput className="w-3 h-3" />
            </button>

            {/* Rename folder */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFolderToRename(folder);
                setFolderRenameValue(folder.name);
              }}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-700"
              title="Rename folder"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Delete folder */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFolderToDelete(folder);
                setFolderDeleteMode('safe');
              }}
              className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-700"
              title="Delete folder"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Nested Contents (Subfolders & Documents) */}
        {isExpanded && (
          <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 border-l border-zinc-800 hover:border-zinc-700 ml-3.5 my-0.5 transition-colors">
            {/* 1. Render Child Subfolders Recursively */}
            {subfolders.map((childFolder) => renderFolderItem(childFolder, depth + 1))}

            {/* 2. Render Documents in this Folder */}
            {folderDocs.map((doc) => {
              const isActive = activeDocumentId === doc.id;
              return (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={(e) => handleDocDragStart(e, doc.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDocId(doc.id);
                  }}
                  onDrop={(e) => handleDocDrop(e, doc.id)}
                  onClick={() => onSelectDocument(doc.id)}
                  className={`group/doc flex items-center justify-between p-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical className="w-3 h-3 text-zinc-500 opacity-0 group-hover/doc:opacity-100 cursor-grab shrink-0" />
                    <span className="text-xs shrink-0">
                      {doc.docType === 'character'
                        ? doc.coverEmoji || doc.characterData?.avatarEmoji || '👤'
                        : doc.coverEmoji || '📄'}
                    </span>
                    <span className="truncate flex-1">{doc.title}</span>
                    {doc.docType === 'character' && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold shrink-0 border border-purple-500/30">
                        Wiki
                      </span>
                    )}
                    {doc.isFavorite && (
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    {getStatusBadge(doc.status)}
                  </div>

                  <div
                    className={`opacity-0 group-hover/doc:opacity-100 flex items-center gap-0.5 transition-opacity ${
                      isActive ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateDocument(doc.id);
                      }}
                      className="p-1 hover:text-indigo-200 rounded"
                      title="Duplicate file"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocToDelete(doc);
                      }}
                      className="p-1 hover:text-rose-300 rounded"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty Folder Notice */}
            {folderDocs.length === 0 && subfolders.length === 0 && (
              <div className="text-[11px] text-zinc-500 py-1 pl-2 italic flex items-center justify-between">
                <span>Empty folder</span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetFolderParentId(folder.id);
                    setIsCreatingFolder(true);
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  + Add subfolder
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`h-full flex flex-col border-r border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-72 sm:w-80'
      }`}
    >
      {/* Top Project Selector Header */}
      <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">{activeProject?.icon || '📁'}</span>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                  Active Project
                </label>
                <div className="relative group/proj">
                  {projects.length > 0 ? (
                    <>
                      <select
                        value={activeProjectId}
                        onChange={(e) => onSelectProject(e.target.value)}
                        className="w-full text-xs font-bold text-zinc-100 bg-transparent border-0 focus:ring-0 p-0 pr-4 truncate cursor-pointer appearance-none hover:text-indigo-300 transition-colors"
                      >
                        {projects.map((p) => {
                          const isDefault =
                            p.isDefault || p.id === 'proj-default-workspace' || p.name === 'My Workspace';
                          return (
                            <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-200">
                              {p.icon || '📁'} {p.name}{isDefault ? ' (Default)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/proj:text-zinc-200" />
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNewProjectModal(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold text-left truncate cursor-pointer"
                    >
                      + Create First Project
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-lg">{activeProject?.icon || '📁'}</span>
          </div>
        )}

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-indigo-600/30 text-zinc-400 hover:text-indigo-300 border border-zinc-700/60 transition-colors cursor-pointer"
              title="Create new Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Action Tools: New File, New Character, New Folder, Search */}
          <div className="p-3 border-b border-zinc-800/60 space-y-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="sidebar-new-file-btn"
                onClick={() => onCreateDocument(activeProjectId, null, 'Untitled Document.md', 'document')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                title="Create Standard Note or Document"
              >
                <FilePlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Doc</span>
              </button>
              <button
                type="button"
                id="sidebar-new-character-btn"
                onClick={() => onCreateDocument(activeProjectId, null, 'New Character', 'character')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                title="Create Wikipedia-Style Character Info Page"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0 text-purple-200" />
                <span className="truncate">Character</span>
              </button>
              <button
                type="button"
                id="sidebar-new-folder-btn"
                onClick={() => {
                  setIsCreatingFolder(true);
                  setTargetFolderParentId(null);
                }}
                className="flex items-center justify-center p-1.5 px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors cursor-pointer"
                title="Create Root Folder"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span className="ml-1 text-[11px] hidden sm:inline">Folder</span>
              </button>
            </div>

            {/* Search filter in project files */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes & files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* New Folder / Subfolder Inline Form */}
          {isCreatingFolder && (
            <form
              onSubmit={handleCreateFolderSubmit}
              className="p-3 bg-zinc-800/60 border-b border-zinc-700/80 animate-in fade-in"
            >
              <div className="text-[11px] font-semibold text-zinc-200 mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {targetParentFolder
                      ? `New Subfolder in "${targetParentFolder.name}"`
                      : 'Create Root Folder'}
                  </span>
                </div>
                {targetParentFolder && (
                  <button
                    type="button"
                    onClick={() => setTargetFolderParentId(null)}
                    className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Switch to Root
                  </button>
                )}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder={
                    targetParentFolder ? 'Subfolder Name...' : 'Folder Name (e.g. Lore, Drafts)...'
                  }
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 font-medium"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-amber-500 text-zinc-950 text-xs font-bold rounded-lg hover:bg-amber-400 cursor-pointer shadow-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setTargetFolderParentId(null);
                  }}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </form>
          )}

          {/* Hierarchical Folder & Document Tree */}
          <div
            className={`flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin transition-colors ${
              dragOverFolderId === 'root' && draggedFolderId
                ? 'bg-indigo-950/20 ring-2 ring-inset ring-indigo-500/40 rounded-xl'
                : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverFolderId('root');
            }}
            onDragLeave={(e) => {
              // Only reset if leaving root container
              if (e.currentTarget === e.target) {
                setDragOverFolderId(null);
              }
            }}
            onDrop={(e) => handleFolderDrop(e, null)}
          >
            {/* Unnest to Root Drag & Drop Banner */}
            {draggedFolderId && (
              <div className="p-2 mb-1.5 rounded-lg border-2 border-dashed border-indigo-500/50 bg-indigo-950/30 text-center text-xs text-indigo-300 animate-pulse flex items-center justify-center gap-1.5">
                <FolderInput className="w-3.5 h-3.5 text-indigo-400" />
                <span>Drop here to move folder to Root Level</span>
              </div>
            )}

            {/* Hierarchical Root Folders List */}
            {rootFolders.map((folder) => renderFolderItem(folder, 0))}

            {/* Root Level Documents (Not inside any folder) */}
            {rootDocs.length > 0 && (
              <div className="pt-2">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Root Documents</span>
                  <span className="font-normal text-zinc-600">{rootDocs.length}</span>
                </div>
                {rootDocs.map((doc) => {
                  const isActive = activeDocumentId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      draggable
                      onDragStart={(e) => handleDocDragStart(e, doc.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverDocId(doc.id);
                      }}
                      onDrop={(e) => handleDocDrop(e, doc.id)}
                      onClick={() => onSelectDocument(doc.id)}
                      className={`group/doc flex items-center justify-between p-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <GripVertical className="w-3 h-3 text-zinc-500 opacity-0 group-hover/doc:opacity-100 cursor-grab shrink-0" />
                        <span className="text-xs shrink-0">
                          {doc.docType === 'character'
                            ? doc.coverEmoji || doc.characterData?.avatarEmoji || '👤'
                            : doc.coverEmoji || '📄'}
                        </span>
                        <span className="truncate flex-1">{doc.title}</span>
                        {doc.docType === 'character' && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold shrink-0 border border-purple-500/30">
                            Wiki
                          </span>
                        )}
                        {doc.isFavorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                        {getStatusBadge(doc.status)}
                      </div>

                      <div
                        className={`opacity-0 group-hover/doc:opacity-100 flex items-center gap-0.5 transition-opacity ${
                          isActive ? 'text-white' : 'text-zinc-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateDocument(doc.id);
                          }}
                          className="p-1 hover:text-indigo-200 rounded"
                          title="Duplicate file"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocToDelete(doc);
                          }}
                          className="p-1 hover:text-rose-300 rounded"
                          title="Delete file"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredDocs.length === 0 && projectFolders.length === 0 && (
              <div className="p-6 text-center text-xs text-zinc-500 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-zinc-300 font-semibold mb-1">
                    {projects.length === 0 ? 'No Projects Yet' : 'No Documents Found'}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {projects.length === 0
                      ? 'Create your first project or click "+ Doc" to begin writing.'
                      : 'Click "+ Doc", "+ Character", or "+ Folder" to add items.'}
                  </p>
                </div>
                {projects.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Project Management Footer */}
          <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/40">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{projectDocs.length} Docs</span>
              <span>•</span>
              <span>{projectFolders.length} Folders</span>
            </div>
            <div className="flex items-center gap-1">
              {onOpenSettings && (
                <button
                  type="button"
                  id="sidebar-open-settings-btn"
                  onClick={onOpenSettings}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors p-1.5 rounded-lg"
                  title="Writing Suite Settings & Backup"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              )}
              {activeProject && (
                activeProject.isDefault || activeProject.id === 'proj-default-workspace' || activeProject.name === 'My Workspace' ? (
                  <span
                    className="text-zinc-600 p-1 cursor-not-allowed flex items-center"
                    title="My Workspace is the default project and cannot be deleted"
                  >
                    <Trash2 className="w-3 h-3 opacity-30" />
                  </span>
                ) : (
                  <button
                    type="button"
                    id="sidebar-delete-project-btn"
                    onClick={() => setProjectToDelete(activeProject)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="Delete this project"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* MOVE / NEST FOLDER MODAL */}
      {folderToMove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700/80 p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Move &amp; Nest Folder: <span className="text-amber-300">{folderToMove.name}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFolderToMove(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-zinc-400 mb-3">
                Select a new parent destination for <strong className="text-zinc-200">"{folderToMove.name}"</strong>:
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {/* Option 1: Root Level (Unnested) */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateFolder(folderToMove.id, { parentId: null });
                    setFolderToMove(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    !folderToMove.parentId
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold">📁 Project Root (Top Level)</div>
                      <div className="text-[10px] text-zinc-500">Unnested at the base of the project</div>
                    </div>
                  </div>
                  {!folderToMove.parentId && <Check className="w-4 h-4 text-indigo-400" />}
                </button>

                {/* Option 2: Other Eligible Folders */}
                {projectFolders
                  .filter((f) => f.id !== folderToMove.id && !isDescendant(f.id, folderToMove.id))
                  .map((destinationFolder) => {
                    const isCurrentParent = folderToMove.parentId === destinationFolder.id;
                    const path = getFolderBreadcrumbPath(destinationFolder.id);

                    return (
                      <button
                        key={destinationFolder.id}
                        type="button"
                        onClick={() => {
                          onUpdateFolder(folderToMove.id, { parentId: destinationFolder.id });
                          setExpandedFolderIds((prev) => ({ ...prev, [destinationFolder.id]: true }));
                          setFolderToMove(null);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isCurrentParent
                            ? 'bg-amber-500/20 border-amber-500 text-white font-semibold'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CornerDownRight className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">
                              {destinationFolder.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              Path: {path}
                            </div>
                          </div>
                        </div>
                        {isCurrentParent && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setFolderToMove(null)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE FOLDER IN-APP CONFIRMATION MODAL */}
      {folderToDelete && (() => {
        const getAllSubfolderIds = (rootId: string): string[] => {
          const children = projectFolders.filter((f) => f.parentId === rootId);
          return [rootId, ...children.flatMap((c) => getAllSubfolderIds(c.id))];
        };
        const allDescendantFolderIds = getAllSubfolderIds(folderToDelete.id);
        const directDocsInFolder = projectDocs.filter((d) => d.folderId === folderToDelete.id);
        const allDocsInFolderTree = projectDocs.filter(
          (d) => d.folderId && allDescendantFolderIds.includes(d.folderId)
        );
        const directSubfolders = projectFolders.filter((f) => f.parentId === folderToDelete.id);
        const isFolderEmpty = directDocsInFolder.length === 0 && directSubfolders.length === 0;

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700/80 p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Delete Folder</h3>
                    <p className="text-[11px] text-zinc-400">"{folderToDelete.name}"</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFolderToDelete(null)}
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Breadcrumbs path preview */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Path:</span>
                    <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[220px]">
                      {getFolderBreadcrumbPath(folderToDelete.id)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Contents:</span>
                    <span className="text-zinc-200 font-medium">
                      {allDocsInFolderTree.length} document{allDocsInFolderTree.length === 1 ? '' : 's'}
                      {allDescendantFolderIds.length > 1 &&
                        ` • ${allDescendantFolderIds.length - 1} subfolder${
                          allDescendantFolderIds.length - 1 === 1 ? '' : 's'
                        }`}
                    </span>
                  </div>
                </div>

                {isFolderEmpty ? (
                  <p className="text-zinc-300">
                    This folder is empty. Are you sure you want to delete it?
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-zinc-300 font-medium">
                      Choose what to do with the documents &amp; subfolders inside:
                    </p>
                    <div className="space-y-2">
                      <label
                        onClick={() => setFolderDeleteMode('safe')}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          folderDeleteMode === 'safe'
                            ? 'bg-indigo-600/15 border-indigo-500/80 text-white ring-1 ring-indigo-500/50'
                            : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="folderDeleteMode"
                          checked={folderDeleteMode === 'safe'}
                          onChange={() => setFolderDeleteMode('safe')}
                          className="mt-0.5 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span>Preserve contents (Move up)</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-medium">
                              Safe
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Move all {allDocsInFolderTree.length} document{allDocsInFolderTree.length === 1 ? '' : 's'} and subfolders to{' '}
                            {folderToDelete.parentId ? 'parent folder' : 'project root'}.
                          </div>
                        </div>
                      </label>

                      <label
                        onClick={() => setFolderDeleteMode('recursive')}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          folderDeleteMode === 'recursive'
                            ? 'bg-rose-500/15 border-rose-500/80 text-white ring-1 ring-rose-500/50'
                            : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="folderDeleteMode"
                          checked={folderDeleteMode === 'recursive'}
                          onChange={() => setFolderDeleteMode('recursive')}
                          className="mt-0.5 text-rose-500 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-rose-300">
                            Delete folder and all contents
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Permanently deletes this folder along with all {allDocsInFolderTree.length} document{allDocsInFolderTree.length === 1 ? '' : 's'} and nested subfolders.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFolderToDelete(null)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-folder-btn"
                  onClick={() => {
                    const isRecursive = !isFolderEmpty && folderDeleteMode === 'recursive';
                    onDeleteFolder(folderToDelete.id, isRecursive);
                    setFolderToDelete(null);
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Folder</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENAME FOLDER IN-APP MODAL */}
      {folderToRename && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700/80 p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Rename Folder</h3>
              </div>
              <button
                type="button"
                onClick={() => setFolderToRename(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (folderRenameValue.trim()) {
                  onUpdateFolder(folderToRename.id, { name: folderRenameValue.trim() });
                  setFolderToRename(null);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={folderRenameValue}
                  onChange={(e) => setFolderRenameValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFolderToRename(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROJECT IN-APP MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700/80 p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Delete Project</h3>
              </div>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {projectToDelete.isDefault ||
            projectToDelete.id === 'proj-default-workspace' ||
            projectToDelete.name === 'My Workspace' ? (
              <div className="space-y-3 text-xs text-zinc-300">
                <p className="text-amber-400 font-semibold">
                  "{projectToDelete.name}" is the default workspace and cannot be deleted.
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Every writing workspace requires a primary default project to organize notes, documents, and folders.
                </p>
                <div className="flex items-center justify-end pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(null)}
                    className="px-3.5 py-1.5 text-xs text-zinc-200 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>
                    Are you sure you want to delete <strong className="text-white">"{projectToDelete.name}"</strong>?
                  </p>
                  <p className="text-zinc-400 text-[11px]">
                    All documents and folders within this project will be deleted permanently.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(null)}
                    className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="confirm-delete-project-btn"
                    onClick={() => {
                      onDeleteProject(projectToDelete.id);
                      setProjectToDelete(null);
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE DOCUMENT IN-APP MODAL */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700/80 p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">Delete Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <p>
                Are you sure you want to delete <strong className="text-white">"{docToDelete.title}"</strong>?
              </p>
              <p className="text-zinc-400 text-[11px]">
                This document will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDocument(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700/80 p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Create New Project</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Sci-Fi Novel, Academic Thesis, Daily Blog"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Project Icon</label>
                <div className="flex gap-2">
                  {['📁', '✨', '🚀', '💼', '📓', '📚', '🔬', '💡', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewProjectIcon(emoji)}
                      className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                        newProjectIcon === emoji
                          ? 'bg-indigo-600/40 border border-indigo-400 scale-110'
                          : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
