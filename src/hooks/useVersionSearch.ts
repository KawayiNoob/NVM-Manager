import { useState, useMemo } from 'react';

export function useVersionSearch(availableVersions: string[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAvailableVersions = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableVersions;
    }
    const query = searchQuery.toLowerCase().trim();
    return availableVersions.filter((version) => {
      const cleanVersion = version.toLowerCase().replace(/^v/, '');
      const cleanQuery = query.replace(/^v/, '');
      return (
        version.toLowerCase().includes(query) ||
        cleanVersion.includes(cleanQuery) ||
        cleanVersion.startsWith(cleanQuery)
      );
    });
  }, [availableVersions, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredAvailableVersions,
  };
}
