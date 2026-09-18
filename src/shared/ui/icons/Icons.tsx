import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, size = 20, ...props }: IconProps & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ChatIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6-1 0-2-.15-2.9-.43L4 20.5l1.5-3.9A7.2 7.2 0 0 1 3.5 11.6C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.4a1.6 1.6 0 0 0 .32 1.77l.06.06a1.94 1.94 0 1 1-2.75 2.75l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47v.17a1.94 1.94 0 0 1-3.88 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06A1.94 1.94 0 1 1 4.72 16.3l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-.97h-.17a1.94 1.94 0 1 1 0-3.88h.09a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a1.94 1.94 0 1 1 2.75-2.75l.06.06a1.6 1.6 0 0 0 1.77.32h.08a1.6 1.6 0 0 0 .97-1.47v-.17a1.94 1.94 0 0 1 3.88 0v.09a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a1.94 1.94 0 1 1 2.75 2.75l-.06.06a1.6 1.6 0 0 0-.32 1.77v.08a1.6 1.6 0 0 0 1.47.97h.17a1.94 1.94 0 1 1 0 3.88h-.09a1.6 1.6 0 0 0-1.47.97Z" />
    </Icon>
  );
}

export function SendIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M4.3 11.4 19.1 4.5c.8-.37 1.66.5 1.28 1.3l-6.9 14.8c-.37.8-1.54.72-1.8-.12l-1.53-4.9a1 1 0 0 0-.65-.65l-4.9-1.53c-.84-.26-.92-1.43-.12-1.8Z" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function EyeIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M9.9 5.7A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.6M6.4 7.6A16.8 16.8 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1M4 4l16 16M10.4 10.5a2.2 2.2 0 0 0 3.1 3.1" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Icon>
  );
}

export function BackIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M14.5 6 9 12l5.5 6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="m5 12.8 4.2 4.2L19 7" />
    </Icon>
  );
}

export function DoubleCheckIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="m2 12.6 3.6 3.6L13.8 8" />
      <path d="m10.2 15.6.9.9L22 6.4" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M12 4.8 2.8 20h18.4L12 4.8Z" />
      <path d="M12 10.5v4M12 17.5h.01" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M14.5 16.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5h7A1.5 1.5 0 0 1 14.5 5v2.5M10 12h10m0 0-3-3m3 3-3 3" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M7 7l.7 12.1A1.5 1.5 0 0 0 9.2 20.5h5.6a1.5 1.5 0 0 0 1.5-1.4L17 7" />
    </Icon>
  );
}

export function UserIcon(props: IconProps & { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c.9-3.4 3.8-5.4 7.2-5.4s6.3 2 7.2 5.4" />
    </Icon>
  );
}

/*
 * Флаги нарисованы вручную: эмодзи-флаги не отображаются в Windows —
 * вместо 🇷🇺 система показывает буквы «RU».
 */
export function FlagRuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" {...props}>
      <rect width="20" height="14" rx="2.5" fill="#fff" />
      <path d="M0 4.667h20v4.666H0z" fill="#0039A6" />
      <path d="M0 9.333h20V11.5A2.5 2.5 0 0 1 17.5 14h-15A2.5 2.5 0 0 1 0 11.5Z" fill="#D52B1E" />
      <rect x="0.4" y="0.4" width="19.2" height="13.2" rx="2.1" fill="none" stroke="rgba(23,26,38,.12)" strokeWidth="0.8" />
    </svg>
  );
}

export function FlagByIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" {...props}>
      <rect width="20" height="14" rx="2.5" fill="#C8313E" />
      <path d="M0 9.333h20V11.5A2.5 2.5 0 0 1 17.5 14h-15A2.5 2.5 0 0 1 0 11.5Z" fill="#4AA657" />
      <rect x="0.4" y="0.4" width="19.2" height="13.2" rx="2.1" fill="none" stroke="rgba(23,26,38,.12)" strokeWidth="0.8" />
    </svg>
  );
}

export function EmptyChatsIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="60" cy="60" r="60" fill="#E7ECFA" />
      <rect x="26" y="40" width="50" height="34" rx="10" fill="#fff" />
      <path d="M38 56h26M38 64h16" stroke="#C3CDE6" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 74v7l9-7" fill="#fff" />
      <rect x="58" y="52" width="38" height="28" rx="9" fill="#CBD6EF" />
      <path d="M68 64h18M68 71h11" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M88 80v6l-8-6" fill="#CBD6EF" />
    </svg>
  );
}
