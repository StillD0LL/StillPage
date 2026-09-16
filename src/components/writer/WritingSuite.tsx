import React, { useState, useEffect, useRef } from 'react';
import { ProjectSidebar } from './ProjectSidebar';
import { WritingToolbar } from './WritingToolbar';
import { DocumentEditor } from './DocumentEditor';
import { CharacterWikiEditor } from './CharacterWikiEditor';
import { ImageViewer } from './ImageViewer';
import { ImportImageModal } from './modals/ImportImageModal';
import { WritingSettingsModal } from './WritingSettingsModal';
import {
  WritingProject,
  WritingFolder,
  WritingDocument,
  WritingSuiteSettings,
  WritingDocType,
  CharacterProfile,
  PageId,
} from '../../types';
import { storage, DEFAULT_WORKSPACE_PROJECT } from '../../services/storage';
import {
  createDefaultCharacterProfile,
  characterProfileToMarkdown,
  CHARACTER_TEMPLATES,
} from '../../utils/characterDefaults';
import {
  Sparkles,
  FileText,
  BookOpen,
  Briefcase,
  Feather,
  Cpu,
  PenLine,
  Minimize2,
  Settings2,
  Check,
  User,
} from 'lucide-react';

interface WritingSuiteProps {
  onBackToDashboard?: () => void;
  activePage?: PageId;
  onSelectPage?: (page: PageId) => void;
}

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl-chapter',
    name: 'Novel Chapter Draft',
    category: 'Creative Writing',
    description: 'Structured narrative template with scenes, character arcs, sensory details, and pacing notes.',
    icon: <Feather className="w-5 h-5 text-purple-400" />,
    content: `# Chapter Title

> *"A memorable opening epigraph or thematic hook."*

## Scene 1: The Inciting Pulse
- **Setting & Atmosphere**: Early morning mist, high iron towers, chill autumn breeze.
- **POV Character**: Kael (Motivations: Discover the anomaly before the curfew).
- **Core Conflict**: The compass refuses to align with true north.

### Narrative
The heavy cedar door swung inward with a dry groan. Outside, the lanterns of the harbor district flickered through the damp sea-fog...

## Scene 2: The Encounter
- **Key Dialogue Exchange**:
  > "You weren't supposed to return until the solstice."
  > "The solstice came early this year."

## Chapter Reflections & Foreshadowing
1. Key clue discovered in the archives
2. Seed planted for the third act reversal
`,
  },
  {
    id: 'tpl-journal',
    name: 'Daily Reflection & Journal',
    category: 'Personal',
    description: 'Mindfulness prompts, morning intentions, daily milestones, and evening gratitude.',
    icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
    content: `# Daily Reflection — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

## 🌅 Morning Mindset
- **Primary Focus / Intent for Today**: 
- **Current Energy Level**: 🟢 High / 🟡 Steady / 🔴 Rest needed
- **Daily Affirmation**: *"Progress over perfection, one deliberate step at a time."*

## 🎯 Top 3 Priorities
- [ ] 1. 
- [ ] 2. 
- [ ] 3. 

## 💡 Notes, Insights & Observations
- 

## 🌙 Evening Gratitude & Review
- **What went exceptionally well today?**: 
- **What did I learn from obstacles?**: 
- **3 Things I am Grateful For**:
  1. 
  2. 
  3. 
`,
  },
  {
    id: 'tpl-tech-spec',
    name: 'Technical Architecture RFC',
    category: 'Engineering',
    description: 'System design document with architecture diagrams, requirements, edge cases, and rollout strategy.',
    icon: <Cpu className="w-5 h-5 text-sky-400" />,
    content: `# RFC: System Architecture Specification

## 1. Executive Summary
Brief summary of the engineering challenge, technical objectives, and proposed system architecture.

## 2. Background & Problem Statement
- **Current Limitations**: 
- **Scale Requirements**: 
- **Target SLA**: 99.99% availability with < 50ms p99 latency.

## 3. Proposed Architecture
\`\`\`
[ Client App ]  -->  [ Edge Gateway / CDN ]  -->  [ Core Microservices ]
                                                          |
                                                    [ Persistence ]
\`\`\`

## 4. API Schema & Data Contracts
| Endpoint | Method | Description | Auth Scope |
| :--- | :--- | :--- | :--- |
| \`/api/v1/workspace\` | GET | Retrieve workspace payload | \`read:workspace\` |
| \`/api/v1/sync\` | POST | Commit delta state stream | \`write:workspace\` |

## 5. Security, Risk & Mitigations
- **Failure Mode 1**: 
- **Mitigation Strategy**: 
`,
  },
  {
    id: 'tpl-meeting',
    name: 'Meeting Minutes & Action Items',
    category: 'Productivity',
    description: 'Organized meeting log with agenda items, decisions recorded, and assigned next steps.',
    icon: <Briefcase className="w-5 h-5 text-amber-400" />,
    content: `# Meeting Notes: Product Strategy Sync

- **Date**: ${new Date().toLocaleDateString()}
- **Attendees**: @Team Lead, @Engineering, @Design
- **Goal**: Align on Q3 roadmap deliverable milestones.

## 📌 Agenda
1. Review sprint burndown and release readiness
2. Architectural review of multi-page navigation system
3. Open discussion & roadblocks

## 💬 Key Discussion Points
- **Point 1**: 
- **Point 2**: 

## ✅ Decisions Made
- [x] Adopt bookmark-style navigation markers with smooth hover transitions
- [x] Persist project trees and active document states locally

## 🚀 Action Items
- [ ] **@Dev**: Finalize export pipelines for Markdown and PDF
- [ ] **@Design**: Polish high-contrast typographic pairings
`,
  },
];

export const WritingSuite: React.FC<WritingSuiteProps> = ({
  onBackToDashboard,
  activePage = 'writer',
  onSelectPage,
}) => {
  // Load state from storage
  const [projects, setProjects] = useState<WritingProject[]>(() => storage.getWritingProjects());
  const [folders, setFolders] = useState<WritingFolder[]>(() => storage.getWritingFolders());
  const [documents, setDocuments] = useState<WritingDocument[]>(() => storage.getWritingDocuments());
  const [settings, setSettings] = useState<WritingSuiteSettings>(() => storage.getWritingSettings());

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const projs = storage.getWritingProjects();
    return projs.length > 0 ? projs[0].id : '';
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => {
    const projs = storage.getWritingProjects();
    const docs = storage.getWritingDocuments();
    if (projs.length === 0) return null;
    const activeProjectDocs = docs.filter((d) => d.projectId === projs[0].id);
    return activeProjectDocs.length > 0 ? activeProjectDocs[0].id : docs[0]?.id || null;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showImportImageModal, setShowImportImageModal] = useState(false);
  const [importTargetFolderId, setImportTargetFolderId] = useState<string | null>(null);

  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Keyboard shortcut listener to exit Zen Focus Mode cleanly with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settings.zenMode) {
        setSettings((prev) => ({ ...prev, zenMode: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.zenMode]);

  // Auto-persist changes
  useEffect(() => {
    storage.saveWritingProjects(projects);
  }, [projects]);

  useEffect(() => {
    storage.saveWritingFolders(folders);
  }, [folders]);

  useEffect(() => {
    storage.saveWritingDocuments(documents);
  }, [documents]);

  useEffect(() => {
    storage.saveWritingSettings(settings);
  }, [settings]);

  // Restore and Merge handlers for Writing Suite JSON backups
  const handleRestoreWorkspace = (
    data: {
      projects?: WritingProject[];
      folders?: WritingFolder[];
      documents?: WritingDocument[];
      settings?: Partial<WritingSuiteSettings>;
    },
    mode: 'replace' | 'merge'
  ) => {
    if (mode === 'replace') {
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        setActiveProjectId(data.projects[0].id);
      }
      if (data.folders) {
        setFolders(data.folders);
      }
      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        const matchingDoc = data.documents.find(
          (d) => d.projectId === (data.projects?.[0]?.id || activeProjectId)
        );
        setActiveDocumentId(matchingDoc ? matchingDoc.id : data.documents[0].id);
      }
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } else {
      // Merge mode
      if (data.projects && data.projects.length > 0) {
        const existingIds = new Set(projects.map((p) => p.id));
        const newProjs = data.projects.filter((p) => !existingIds.has(p.id));
        setProjects((prev) => [...prev, ...newProjs]);
      }
      if (data.folders && data.folders.length > 0) {
        const existingFolderIds = new Set(folders.map((f) => f.id));
        const newFlds = data.folders.filter((f) => !existingFolderIds.has(f.id));
        setFolders((prev) => [...prev, ...newFlds]);
      }
      if (data.documents && data.documents.length > 0) {
        const existingDocIds = new Set(documents.map((d) => d.id));
        const newDocs = data.documents.filter((d) => !existingDocIds.has(d.id));
        setDocuments((prev) => [...newDocs, ...prev]);
        if (newDocs.length > 0) {
          setActiveDocumentId(newDocs[0].id);
          setActiveProjectId(newDocs[0].projectId);
        }
      }
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    }
  };

  const handleResetToDefaults = () => {
    storage.resetWritingSuiteData();
    const defaultProjs = storage.getWritingProjects();
    const defaultFlds = storage.getWritingFolders();
    const defaultDocs = storage.getWritingDocuments();
    const defaultSet = storage.getWritingSettings();
    setProjects(defaultProjs);
    setFolders(defaultFlds);
    setDocuments(defaultDocs);
    setSettings(defaultSet);
    if (defaultProjs.length > 0) {
      setActiveProjectId(defaultProjs[0].id);
    }
    if (defaultDocs.length > 0) {
      setActiveDocumentId(defaultDocs[0].id);
    }
  };

  // Active document object
  const activeDocument = documents.find((d) => d.id === activeDocumentId) || null;

  // Insert markdown helper for the active textarea
  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = editorTextareaRef.current;
    if (!textarea || !activeDocument) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end) || defaultText;

    const newVal = currentVal.substring(0, start) + prefix + selectedText + suffix + currentVal.substring(end);

    handleUpdateDocument(activeDocument.id, {
      content: newVal,
      wordCount: newVal.trim() ? newVal.trim().split(/\s+/).length : 0,
      charCount: newVal.length,
      readingTimeMinutes: Math.max(1, Math.ceil(newVal.trim().split(/\s+/).length / 200)),
      updatedAt: Date.now(),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selectedText.length;
    }, 0);
  };

  // Document Operations
  const handleCreateDocument = (
    projectId: string,
    folderId: string | null = null,
    title: string = 'Untitled Document.md',
    docType: WritingDocType = 'document',
    initialCharacterData?: CharacterProfile
  ) => {
    let targetProjId = projectId;
    if (!targetProjId || !projects.some((p) => p.id === targetProjId)) {
      if (projects.length > 0) {
        targetProjId = projects[0].id;
        setActiveProjectId(projects[0].id);
      } else {
        const defaultProj = storage.getWritingProjects()[0] || DEFAULT_WORKSPACE_PROJECT;
        targetProjId = defaultProj.id;
        setProjects([defaultProj]);
        setActiveProjectId(defaultProj.id);
      }
    }

    const isChar = docType === 'character';
    const isImage = docType === 'image';
    const cleanTitle = isImage
      ? title
      : title.replace(/\.(md|wiki|txt)$/i, '');

    const charProfile = isChar
      ? initialCharacterData || createDefaultCharacterProfile(cleanTitle === 'New Character' ? 'New Character' : cleanTitle)
      : undefined;

    const content = isChar
      ? characterProfileToMarkdown(charProfile!)
      : `# ${cleanTitle}\n\nStart typing here...`;

    const newDoc: WritingDocument = {
      id: `doc-${Date.now()}`,
      projectId: targetProjId,
      folderId,
      title: isChar ? charProfile!.name : cleanTitle,
      content,
      docType,
      characterData: charProfile,
      tags: isChar ? ['Character', 'Wiki', 'Lore'] : [],
      wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
      charCount: content.length,
      readingTimeMinutes: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200)),
      status: 'in-progress',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverEmoji: isImage ? '🖼️' : isChar ? charProfile?.avatarEmoji || '🧙‍♂️' : '📄',
      isFavorite: false,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDoc.id);
  };

  const handleUpdateDocument = (id: string, updates: Partial<WritingDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc))
    );
  };

  const handleDeleteDocument = (id: string) => {
    const remaining = documents.filter((doc) => doc.id !== id);
    setDocuments(remaining);
    if (activeDocumentId === id) {
      const nextDoc = remaining.find((d) => d.projectId === activeProjectId);
      setActiveDocumentId(nextDoc ? nextDoc.id : null);
    }
  };

  const handleDuplicateDocument = (id: string) => {
    const source = documents.find((d) => d.id === id);
    if (!source) return;

    const duplicateDoc: WritingDocument = {
      ...source,
      id: `doc-${Date.now()}`,
      title: `${source.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setDocuments((prev) => [duplicateDoc, ...prev]);
    setActiveDocumentId(duplicateDoc.id);
  };

  const handleMoveDocumentToFolder = (docId: string, folderId: string | null) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, folderId, updatedAt: Date.now() } : doc))
    );
  };

  // Image directory import handler
  const handleImportImageFile = (imageData: {
    title: string;
    imageUrl: string;
    imageSize?: number;
    imageDimensions?: { width: number; height: number };
    folderId?: string | null;
  }) => {
    const newImageDoc: WritingDocument = {
      id: `doc-img-${Date.now()}`,
      projectId: activeProjectId,
      folderId: imageData.folderId !== undefined ? imageData.folderId : importTargetFolderId,
      title: imageData.title,
      content: imageData.imageUrl,
      docType: 'image',
      imageUrl: imageData.imageUrl,
      imageSize: imageData.imageSize,
      imageDimensions: imageData.imageDimensions,
      tags: ['Image', 'Asset'],
      wordCount: 0,
      charCount: 0,
      readingTimeMinutes: 0,
      status: 'completed',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverEmoji: '🖼️',
      isFavorite: false,
    };

    setDocuments((prev) => [newImageDoc, ...prev]);
    setActiveDocumentId(newImageDoc.id);
  };

  // Project Operations
  const handleCreateProject = (name: string, description?: string, icon?: string, color?: string) => {
    const newProj: WritingProject = {
      id: `proj-${Date.now()}`,
      name,
      description,
      icon: icon || '📁',
      color: color || '#6366f1',
      order: projects.length,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const initialDoc: WritingDocument = {
      id: `doc-${Date.now()}`,
      projectId: newProj.id,
      folderId: null,
      title: 'Getting Started.md',
      content: `# ${name}\n\nStart writing your new project here...`,
      docType: 'document',
      tags: [],
      wordCount: 7,
      charCount: 45,
      readingTimeMinutes: 1,
      status: 'in-progress',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverEmoji: '📄',
      isFavorite: false,
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setDocuments((prev) => [initialDoc, ...prev]);
    setActiveDocumentId(initialDoc.id);
  };

  const handleUpdateProject = (id: string, updates: Partial<WritingProject>) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updates, updatedAt: Date.now() } : proj))
    );
  };

  const handleDeleteProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target || target.isDefault || target.id === 'proj-default-workspace' || target.name === 'My Workspace') {
      return; // Cannot delete default workspace
    }

    const remainingProjects = projects.filter((p) => p.id !== id);
    setProjects(remainingProjects);
    setFolders((prev) => prev.filter((f) => f.projectId !== id));
    setDocuments((prev) => prev.filter((d) => d.projectId !== id));

    const defaultProj = remainingProjects.find(
      (p) => p.isDefault || p.id === 'proj-default-workspace' || p.name === 'My Workspace'
    ) || remainingProjects[0];

    if (defaultProj) {
      setActiveProjectId(defaultProj.id);
      const nextDoc = documents.find((d) => d.projectId === defaultProj.id);
      setActiveDocumentId(nextDoc ? nextDoc.id : null);
    }
  };

  // Folder Operations
  const handleCreateFolder = (projectId: string, name: string, parentId?: string | null) => {
    let targetProjId = projectId;
    if (!targetProjId || !projects.some((p) => p.id === targetProjId)) {
      if (projects.length > 0) {
        targetProjId = projects[0].id;
        setActiveProjectId(projects[0].id);
      } else {
        const defaultProj = storage.getWritingProjects()[0] || DEFAULT_WORKSPACE_PROJECT;
        targetProjId = defaultProj.id;
        setProjects([defaultProj]);
        setActiveProjectId(defaultProj.id);
      }
    }

    const newFolder: WritingFolder = {
      id: `folder-${Date.now()}`,
      projectId: targetProjId,
      name,
      parentId: parentId || null,
      color: '#8b5cf6',
      order: folders.filter((f) => f.projectId === targetProjId).length,
      isExpanded: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setFolders((prev) => {
      // If parentId is specified, ensure parent folder is expanded
      if (parentId) {
        return prev
          .map((f) => (f.id === parentId ? { ...f, isExpanded: true } : f))
          .concat(newFolder);
      }
      return [...prev, newFolder];
    });
  };

  const handleUpdateFolder = (id: string, updates: Partial<WritingFolder>) => {
    setFolders((prev) =>
      prev.map((folder) => (folder.id === id ? { ...folder, ...updates, updatedAt: Date.now() } : folder))
    );
  };

  const handleDeleteFolder = (id: string, deleteContents: boolean = false) => {
    const targetFolder = folders.find((f) => f.id === id);
    if (!targetFolder) return;
    const fallbackParentId = targetFolder.parentId || null;

    if (deleteContents) {
      // Find all descendant folder IDs recursively
      const getAllDescendantFolderIds = (folderId: string): string[] => {
        const children = folders.filter((f) => f.parentId === folderId);
        return [folderId, ...children.flatMap((c) => getAllDescendantFolderIds(c.id))];
      };
      const foldersToDelete = new Set(getAllDescendantFolderIds(id));
      setFolders((prev) => prev.filter((f) => !foldersToDelete.has(f.id)));
      setDocuments((prev) => {
        const remainingDocs = prev.filter((doc) => !doc.folderId || !foldersToDelete.has(doc.folderId));
        if (
          activeDocumentId &&
          prev.some((d) => d.id === activeDocumentId && d.folderId && foldersToDelete.has(d.folderId))
        ) {
          const nextDoc = remainingDocs.find((d) => d.projectId === activeProjectId) || remainingDocs[0];
          setActiveDocumentId(nextDoc ? nextDoc.id : null);
        }
        return remainingDocs;
      });
    } else {
      // Elevate subfolders and documents up to parent or root (safe delete)
      setFolders((prev) =>
        prev
          .filter((f) => f.id !== id)
          .map((f) => (f.parentId === id ? { ...f, parentId: fallbackParentId, updatedAt: Date.now() } : f))
      );
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.folderId === id ? { ...doc, folderId: fallbackParentId, updatedAt: Date.now() } : doc
        )
      );
    }
  };

  // Template Application
  const handleApplyTemplate = (tpl: TemplateItem) => {
    let targetProjId = activeProjectId;
    if (!targetProjId || !projects.some((p) => p.id === targetProjId)) {
      if (projects.length > 0) {
        targetProjId = projects[0].id;
        setActiveProjectId(projects[0].id);
      } else {
        const defaultProj = storage.getWritingProjects()[0] || DEFAULT_WORKSPACE_PROJECT;
        targetProjId = defaultProj.id;
        setProjects([defaultProj]);
        setActiveProjectId(defaultProj.id);
      }
    }

    const newDoc: WritingDocument = {
      id: `doc-${Date.now()}`,
      projectId: targetProjId,
      folderId: null,
      title: tpl.name,
      content: tpl.content,
      tags: [tpl.category],
      wordCount: tpl.content.trim().split(/\s+/).length,
      charCount: tpl.content.length,
      readingTimeMinutes: Math.max(1, Math.ceil(tpl.content.trim().split(/\s+/).length / 200)),
      status: 'in-progress',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverEmoji: tpl.id === 'tpl-chapter' ? '✨' : tpl.id === 'tpl-journal' ? '📓' : tpl.id === 'tpl-tech-spec' ? '⚡' : '💼',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDoc.id);
    setShowTemplatesModal(false);
  };

  // Export handlers
  const handleExportMarkdown = () => {
    if (!activeDocument) return;
    const blob = new Blob([activeDocument.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocument.title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPlainText = () => {
    if (!activeDocument) return;
    const plain = activeDocument.content.replace(/[#*`_~>[\]]/g, '');
    const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocument.title || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    if (!activeDocument) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${activeDocument.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #18181b; }
    h1, h2, h3 { color: #09090b; }
    pre, code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #52525b; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e4e4e7; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f5; }
  </style>
</head>
<body>
  <h1>${activeDocument.title}</h1>
  <pre style="white-space: pre-wrap; font-family: inherit;">${activeDocument.content}</pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocument.title || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-zinc-950 text-zinc-100 select-text relative">
      {/* Floating Exit Capsule in Zen Focus Mode */}
      {settings.zenMode && (
        <div
          id="zen-focus-exit-banner"
          className="fixed top-3 right-4 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-amber-500/40 text-amber-200 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 select-none group"
        >
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-zinc-400 text-[11px] hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-zinc-300">Focus Mode</span>
          </div>

          <button
            type="button"
            id="zen-open-settings-btn"
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Writing Settings & JSON Backup"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="exit-zen-focus-btn"
            onClick={() => setSettings((prev) => ({ ...prev, zenMode: false }))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title="Exit Focus Mode (or press Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus</span>
            <kbd className="text-[10px] font-mono bg-zinc-950/20 px-1 py-0.2 rounded text-zinc-950">ESC</kbd>
          </button>
        </div>
      )}

      {/* Top Writing Toolbar */}
      {!settings.zenMode && (
        <WritingToolbar
          settings={settings}
          onUpdateSettings={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
          onInsertMarkdown={handleInsertMarkdown}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onExportMarkdown={handleExportMarkdown}
          onExportPlainText={handleExportPlainText}
          onExportHTML={handleExportHTML}
          onPrintPDF={handlePrintPDF}
          wordCount={activeDocument ? activeDocument.wordCount || 0 : 0}
          charCount={activeDocument ? activeDocument.charCount || 0 : 0}
          readingTimeMinutes={activeDocument ? activeDocument.readingTimeMinutes || 1 : 1}
        />
      )}

      {/* Main Workspace Area (Sidebar + Editor) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Project / Folder Sidebar (Hidden in Zen Mode) */}
        {!settings.zenMode && (
          <ProjectSidebar
            projects={projects}
            folders={folders}
            documents={documents}
            activeProjectId={activeProjectId}
            activeDocumentId={activeDocumentId}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              const projectDocs = documents.filter((d) => d.projectId === id);
              if (projectDocs.length > 0) {
                setActiveDocumentId(projectDocs[0].id);
              } else {
                setActiveDocumentId(null);
              }
            }}
            onSelectDocument={(id) => setActiveDocumentId(id)}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onCreateFolder={handleCreateFolder}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
            onCreateDocument={handleCreateDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onDuplicateDocument={handleDuplicateDocument}
            onReorderDocuments={(docs) => setDocuments(docs)}
            onReorderFolders={(flds) => setFolders(flds)}
            onMoveDocumentToFolder={handleMoveDocumentToFolder}
            onOpenImportModal={(folderId) => {
              setImportTargetFolderId(folderId || null);
              setShowImportImageModal(true);
            }}
            onOpenSettings={() => setShowSettingsModal(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Central Workspace Content Area: Image Viewer, Character Wiki, or Standard Document */}
        {activeDocument?.docType === 'image' ? (
          <ImageViewer
            document={activeDocument}
            folders={folders.filter((f) => f.projectId === activeProjectId)}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        ) : activeDocument?.docType === 'character' ? (
          <CharacterWikiEditor
            document={activeDocument}
            settings={settings}
            folders={folders}
            onUpdateDocument={handleUpdateDocument}
          />
        ) : (
          <DocumentEditor
            document={activeDocument}
            settings={settings}
            folders={folders}
            onUpdateDocument={handleUpdateDocument}
            editorTextareaRef={editorTextareaRef}
            onInsertMarkdown={handleInsertMarkdown}
          />
        )}
      </div>

      {/* Writing Settings & Backup Modal */}
      <WritingSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        projects={projects}
        folders={folders}
        documents={documents}
        settings={settings}
        activeProjectId={activeProjectId}
        onUpdateSettings={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
        onRestoreWorkspace={handleRestoreWorkspace}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Choose a Writing Template</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kickstart your writing with pre-formatted blueprints for stories, daily reflections, and specs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="text-zinc-400 hover:text-white text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1 scrollbar-thin">
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="group flex flex-col p-4 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/60 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-indigo-400 transition-colors">
                      {tpl.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                        {tpl.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {tpl.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                    {tpl.description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                    <span>Use Template</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Import Image into Directory Modal */}
      <ImportImageModal
        isOpen={showImportImageModal}
        onClose={() => {
          setShowImportImageModal(false);
          setImportTargetFolderId(null);
        }}
        folders={folders.filter((f) => f.projectId === activeProjectId)}
        initialFolderId={importTargetFolderId}
        onImportImage={(img) => {
          handleImportImageFile({
            title: img.title,
            imageUrl: img.imageUrl,
            imageSize: img.imageSize,
            imageDimensions: img.imageDimensions,
            folderId: img.folderId,
          });
        }}
      />
    </div>
  );
};
