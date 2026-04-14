import { useState, useEffect, useCallback } from 'react';

interface UseWindowControlsOptions {
  hasElectron: boolean;
  checkIsMaximized: () => Promise<boolean>;
  maximizeWindow: () => void;
  minimizeWindow: () => void;
  closeWindow: () => void;
}

export function useWindowControls({
  hasElectron,
  checkIsMaximized,
  maximizeWindow,
  minimizeWindow,
  closeWindow,
}: UseWindowControlsOptions) {
  const [isMaximized, setIsMaximized] = useState(false);

  const updateMaximizedState = useCallback(async () => {
    if (hasElectron) {
      const maximized = await checkIsMaximized();
      setIsMaximized(maximized);
    }
  }, [hasElectron, checkIsMaximized]);

  const handleMaximize = useCallback(() => {
    maximizeWindow();
    setTimeout(updateMaximizedState, 100);
  }, [maximizeWindow, updateMaximizedState]);

  useEffect(() => {
    updateMaximizedState();
  }, [updateMaximizedState]);

  return {
    isMaximized,
    handleMaximize,
    minimizeWindow,
    closeWindow,
  };
}
