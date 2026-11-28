import type { SimpleIcon } from 'simple-icons';
import {
  siBluesky,
  siFacebook,
  siInstagram,
  siMastodon,
  siReddit,
  siThreads,
} from 'simple-icons';

/** Public site destinations, independent of Posthaste publishing credentials. */
export interface SocialNetwork {
  readonly id: string;
  readonly name: string;
  readonly href: `https://${string}`;
  readonly icon: SimpleIcon;
  readonly tooltip: string;
}

export const SOCIAL_NETWORKS = [
  {
    href: 'https://mastodon.social/@samuisamui',
    icon: siMastodon,
    id: 'mastodon',
    name: 'Mastodon',
    tooltip: 'Folge mir auf Mastodon',
  },
  {
    href: 'https://bsky.app/profile/samui-samui.de',
    icon: siBluesky,
    id: 'bluesky',
    name: 'Bluesky',
    tooltip: 'Folge mir auf Bluesky',
  },
  {
    href: 'https://www.reddit.com/r/samuisamui/',
    icon: siReddit,
    id: 'reddit',
    name: 'Reddit',
    tooltip: 'Tausch dich auf Reddit aus',
  },
  {
    href: 'https://www.threads.com/@samuisamui_de',
    icon: siThreads,
    id: 'threads',
    name: 'Threads',
    tooltip: 'Folge mir auf Threads',
  },
  {
    href: 'https://www.facebook.com/samui.samui',
    icon: siFacebook,
    id: 'facebook',
    name: 'Facebook',
    tooltip: 'Folge mir auf Facebook',
  },
  {
    href: 'https://www.instagram.com/samuisamui_de',
    icon: siInstagram,
    id: 'instagram',
    name: 'Instagram',
    tooltip: 'Folge mir auf Instagram',
  },
] as const satisfies readonly SocialNetwork[];

export type SocialNetworkId = (typeof SOCIAL_NETWORKS)[number]['id'];
