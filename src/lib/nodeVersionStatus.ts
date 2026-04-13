export type NodeVersionStatus = 'current' | 'active-lts' | 'maintenance-lts' | 'eol' | 'unknown';

export interface VersionStatusInfo {
  status: NodeVersionStatus;
  label: string;
  description: string;
}

// Node.js LTS 版本信息（基于发布时间表）
// 参考: https://nodejs.org/en/about/previous-releases
const LTS_SCHEDULE: Record<number, { start: number; activeLtsStart: number; maintenanceStart: number; end: number }> = {
  // 2026年当前的版本状态
  24: { start: 2024, activeLtsStart: 2024, maintenanceStart: 2025, end: 2027 },
  23: { start: 2023, activeLtsStart: 0, maintenanceStart: 0, end: 2024 }, // 非LTS
  22: { start: 2024, activeLtsStart: 2024, maintenanceStart: 2025, end: 2027 },
  21: { start: 2023, activeLtsStart: 0, maintenanceStart: 0, end: 2024 }, // 非LTS
  20: { start: 2023, activeLtsStart: 2023, maintenanceStart: 2024, end: 2026 },
  19: { start: 2022, activeLtsStart: 0, maintenanceStart: 0, end: 2023 }, // 非LTS
  18: { start: 2022, activeLtsStart: 2022, maintenanceStart: 2023, end: 2025 },
  17: { start: 2021, activeLtsStart: 0, maintenanceStart: 0, end: 2022 }, // 非LTS
  16: { start: 2021, activeLtsStart: 2021, maintenanceStart: 2022, end: 2024 },
  15: { start: 2020, activeLtsStart: 0, maintenanceStart: 0, end: 2021 }, // 非LTS
  14: { start: 2020, activeLtsStart: 2020, maintenanceStart: 2021, end: 2023 },
  13: { start: 2019, activeLtsStart: 0, maintenanceStart: 0, end: 2020 }, // 非LTS
  12: { start: 2019, activeLtsStart: 2019, maintenanceStart: 2020, end: 2022 },
  10: { start: 2018, activeLtsStart: 2018, maintenanceStart: 2019, end: 2021 },
  8: { start: 2017, activeLtsStart: 2017, maintenanceStart: 2018, end: 2019 },
  6: { start: 2016, activeLtsStart: 2016, maintenanceStart: 2017, end: 2018 },
};

const CURRENT_YEAR = 2026;

/**
 * 从版本字符串中提取主版本号
 */
export function extractMajorVersion(version: string): number {
  const match = version.match(/^v?(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 获取 Node.js 版本状态信息
 */
export function getNodeVersionStatus(version: string): VersionStatusInfo {
  const major = extractMajorVersion(version);

  if (major === 0) {
    return {
      status: 'unknown',
      label: '未知',
      description: '无法识别的版本',
    };
  }

  // 最新版本（高于已知的LTS版本）
  if (major > 24) {
    return {
      status: 'current',
      label: 'Current',
      description: '当前开发版本',
    };
  }

  const schedule = LTS_SCHEDULE[major];

  if (!schedule) {
    return {
      status: 'eol',
      label: 'EoL',
      description: '终止支持',
    };
  }

  // 检查是否是非LTS版本（奇数版本通常是非LTS）
  const isNonLTS = major % 2 !== 0;

  if (isNonLTS) {
    if (CURRENT_YEAR < schedule.end) {
      return {
        status: 'current',
        label: 'Current',
        description: '当前开发版本（非LTS）',
      };
    } else {
      return {
        status: 'eol',
        label: 'EoL',
        description: '终止支持',
      };
    }
  }

  // LTS 版本状态判断
  if (CURRENT_YEAR < schedule.activeLtsStart) {
    return {
      status: 'current',
      label: 'Current',
      description: '即将成为 LTS',
    };
  } else if (CURRENT_YEAR >= schedule.activeLtsStart && CURRENT_YEAR < schedule.maintenanceStart) {
    return {
      status: 'active-lts',
      label: '活跃 LTS',
      description: '活跃长期支持',
    };
  } else if (CURRENT_YEAR >= schedule.maintenanceStart && CURRENT_YEAR < schedule.end) {
    return {
      status: 'maintenance-lts',
      label: '维护 LTS',
      description: '维护期长期支持',
    };
  } else {
    return {
      status: 'eol',
      label: 'EoL',
      description: '终止支持',
    };
  }
}

/**
 * 获取状态对应的样式类名
 */
export function getStatusStyleClasses(status: NodeVersionStatus): { badge: string; text: string } {
  switch (status) {
    case 'current':
      return {
        badge: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        text: 'text-purple-400',
      };
    case 'active-lts':
      return {
        badge: 'bg-green-500/20 text-green-400 border-green-500/40',
        text: 'text-green-400',
      };
    case 'maintenance-lts':
      return {
        badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        text: 'text-yellow-400',
      };
    case 'eol':
      return {
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        text: 'text-red-400',
      };
    default:
      return {
        badge: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
        text: 'text-slate-400',
      };
  }
}
