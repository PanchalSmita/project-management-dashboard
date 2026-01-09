import { useState, useCallback, useRef, useEffect } from "react";

export interface ModalState {
  isOpen: boolean;
  data?: any;
  type?: string;
}

export interface ModalOptions {
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  preventScroll?: boolean;
  focusOnOpen?: boolean;
  restoreFocus?: boolean;
}

const DEFAULT_OPTIONS: ModalOptions = {
  closeOnEscape: true,
  closeOnBackdrop: true,
  preventScroll: true,
  focusOnOpen: true,
  restoreFocus: true,
};

export const useModal = (options: ModalOptions = {}) => {
  const [state, setState] = useState<ModalState>({ isOpen: false });
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Handle escape key
  useEffect(() => {
    if (!config.closeOnEscape || !state.isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [state.isOpen, config.closeOnEscape]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!config.preventScroll) return;

    if (state.isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [state.isOpen, config.preventScroll]);

  // Handle focus management
  useEffect(() => {
    if (state.isOpen && config.focusOnOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal or first focusable element
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstFocusable = focusableElements[0] as HTMLElement;
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 0);
    }

    return () => {
      if (!state.isOpen && config.restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [state.isOpen, config.focusOnOpen, config.restoreFocus]);

  const open = useCallback((data?: any, type?: string) => {
    setState({ isOpen: true, data, type });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false, data: undefined, type: undefined });
  }, []);

  const toggle = useCallback((data?: any, type?: string) => {
    if (state.isOpen) {
      close();
    } else {
      open(data, type);
    }
  }, [state.isOpen, open, close]);

  const updateData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const updateType = useCallback((type: string) => {
    setState(prev => ({ ...prev, type }));
  }, []);

  // Backdrop click handler
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (config.closeOnBackdrop && event.target === event.currentTarget) {
      close();
    }
  }, [config.closeOnBackdrop, close]);

  // Focus trap for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Tab" && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    }
  }, []);

  return {
    // State
    isOpen: state.isOpen,
    data: state.data,
    type: state.type,
    modalRef,

    // Actions
    open,
    close,
    toggle,
    updateData,
    updateType,

    // Event handlers
    handleBackdropClick,
    handleKeyDown,

    // Utilities
    isType: useCallback((type: string) => state.type === type, [state.type]),
    hasData: useCallback(() => state.data !== undefined, [state.data]),
  };
};

// Specialized modal hooks for common use cases
export const useTaskModal = () => {
  const modal = useModal();
  
  const openCreateTask = useCallback((boardId: string, projectId: string) => {
    modal.open({ boardId, projectId }, "create");
  }, [modal]);

  const openEditTask = useCallback((task: any) => {
    modal.open(task, "edit");
  }, [modal]);

  const openViewTask = useCallback((task: any) => {
    modal.open(task, "view");
  }, [modal]);

  return {
    ...modal,
    openCreateTask,
    openEditTask,
    openViewTask,
    isCreateMode: modal.isType("create"),
    isEditMode: modal.isType("edit"),
    isViewMode: modal.isType("view"),
  };
};

export const useConfirmModal = () => {
  const modal = useModal({ closeOnBackdrop: false });

  const confirm = useCallback((
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: { title?: string; confirmText?: string; cancelText?: string }
  ) => {
    modal.open({
      message,
      onConfirm,
      onCancel,
      ...options,
    }, "confirm");
  }, [modal]);

  const handleConfirm = useCallback(() => {
    if (modal.data?.onConfirm) {
      modal.data.onConfirm();
    }
    modal.close();
  }, [modal]);

  const handleCancel = useCallback(() => {
    if (modal.data?.onCancel) {
      modal.data.onCancel();
    }
    modal.close();
  }, [modal]);

  return {
    ...modal,
    confirm,
    handleConfirm,
    handleCancel,
  };
};

export const useProjectModal = () => {
  const modal = useModal();

  const openCreateProject = useCallback(() => {
    modal.open({}, "create");
  }, [modal]);

  const openEditProject = useCallback((project: any) => {
    modal.open(project, "edit");
  }, [modal]);

  const openProjectSettings = useCallback((project: any) => {
    modal.open(project, "settings");
  }, [modal]);

  return {
    ...modal,
    openCreateProject,
    openEditProject,
    openProjectSettings,
    isCreateMode: modal.isType("create"),
    isEditMode: modal.isType("edit"),
    isSettingsMode: modal.isType("settings"),
  };
};

export const useUserModal = () => {
  const modal = useModal();

  const openInviteUser = useCallback(() => {
    modal.open({}, "invite");
  }, [modal]);

  const openEditUser = useCallback((user: any) => {
    modal.open(user, "edit");
  }, [modal]);

  const openUserProfile = useCallback((user: any) => {
    modal.open(user, "profile");
  }, [modal]);

  return {
    ...modal,
    openInviteUser,
    openEditUser,
    openUserProfile,
    isInviteMode: modal.isType("invite"),
    isEditMode: modal.isType("edit"),
    isProfileMode: modal.isType("profile"),
  };
};
