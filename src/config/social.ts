/** Public site destinations, independent of Posthaste publishing credentials. */
export interface SocialNetwork {
  readonly id: string;
  readonly name: string;
  readonly href: `https://${string}`;
  readonly icon: `simple-icons:${string}`;
  readonly tooltip: string;
}

export const SOCIAL_NETWORKS = [
  {
    href: 'https://mastodon.social/@samuisamui',
    icon: 'simple-icons:mastodon',
    id: 'mastodon',
    name: 'Mastodon',
    tooltip: 'Folge mir auf Mastodon',
  },
  {
    href: 'https://bsky.app/profile/samui-samui.de',
    icon: 'simple-icons:bluesky',
    id: 'bluesky',
    name: 'Bluesky',
    tooltip: 'Folge mir auf Bluesky',
  },
  {
    href: 'https://www.reddit.com/r/samuisamui/',
    icon: 'simple-icons:reddit',
    id: 'reddit',
    name: 'Reddit',
    tooltip: 'Tausch dich auf Reddit aus',
  },
  {
    href: 'https://www.threads.com/@samuisamui_de',
    icon: 'simple-icons:threads',
    id: 'threads',
    name: 'Threads',
    tooltip: 'Folge mir auf Threads',
  },
] as const satisfies readonly SocialNetwork[];

export type SocialNetworkId = (typeof SOCIAL_NETWORKS)[number]['id'];
