import { useState, useMemo } from 'react';

function filterVersions(versions: string[], query: string) {
  if (!query.trim()) {
    return versions;
  }
  const lowerQuery = query.toLowerCase().trim();
  const cleanQuery = lowerQuery.replace(/^v/, '');
  return versions.filter((version) => {
    const lowerVersion = version.toLowerCase();
    const cleanVersion = lowerVersion.replace(/^v/, '');
    return (
      lowerVersion.includes(lowerQuery) ||
      cleanVersion.includes(cleanQuery) ||
      cleanVersion.startsWith(cleanQuery)
    );
  });
}

export function useVersionSearch(availableVersions: string[], installedVersions?: string[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [installedSearchQuery, setInstalledSearchQuery] = useState('');

  const filteredAvailableVersions = useMemo(() => {
    return filterVersions(availableVersions, searchQuery);
  }, [availableVersions, searchQuery]);

  const filteredInstalledVersions = useMemo(() => {
    if (!installedVersions) return installedVersions;
    return filterVersions(installedVersions, installedSearchQuery);
  }, [installedVersions, installedSearchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredAvailableVersions,
    installedSearchQuery,
    setInstalledSearchQuery,
    filteredInstalledVersions,
  };
}
