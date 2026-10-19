import type { Locale } from './types';

export const LEGAL_PAGE_IDS = ['about', 'contact', 'privacy', 'terms'] as const;
export type LegalPageId = (typeof LEGAL_PAGE_IDS)[number];

/** A section body: a string renders one paragraph; an array renders one list. */
export type LegalBlock = string | string[];

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalPageCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}

/** Match a normalized (trailing-slash-stripped) pathname to a legal page. */
export function legalPageFromPath(pathname: string): LegalPageId | null {
  const id = pathname.match(/^(?:\/zh-cn)?\/(about|contact|privacy|terms)$/)?.[1];
  return (id as LegalPageId | undefined) ?? null;
}

export const SUPPORT_EMAIL = 'support@svglo.com';
export const REPO_URL = 'https://github.com/xuziyang/svglo';

const englishPages: Record<LegalPageId, LegalPageCopy> = {
  about: {
    metaTitle: 'About SVGlo | Free browser-based image to SVG converter',
    metaDescription:
      'Learn who maintains SVGlo, how the browser-based image to SVG converter works, and why images never leave your device.',
    kicker: 'About',
    title: 'A small, local-first vector tool',
    lead:
      'SVGlo is a free image-to-SVG converter that runs entirely in your browser. It exists to make a routine design task fast, private, and free of account walls.',
    updated: 'Last updated: 19 October 2026',
    sections: [
      {
        id: 'what',
        title: 'What SVGlo does',
        blocks: [
          'SVGlo converts PNG, JPG, JPEG, WebP, GIF, and BMP images into clean SVG paths, and it converts SVG artwork back into JPG or PNG. All processing happens on your device through WebAssembly and Canvas; there is no upload endpoint, no image storage, and no account.',
          'The site is maintained by the SVGlo contributors. The project is open source under the MIT license, and the converter is built on the visioncortex VTracer tracing engine.',
        ],
      },
      {
        id: 'why',
        title: 'Why it is built this way',
        blocks: [
          'Most online converters upload your file to a server, process it there, and keep it for some retention period. That is a poor fit for unreleased logos, client artwork, or anything under NDA. Local processing removes that trade-off: the conversion is just as capable, and the file never leaves the machine.',
          'The tool is funded by unobtrusive advertising and by nothing else. There are no paid tiers, no watermarks, and no conversion caps. Ad placements, when present, are clearly labelled and never overlap the converter or its controls.',
        ],
      },
      {
        id: 'contact',
        title: 'Getting in touch',
        blocks: [
          `Questions, bug reports, and licensing enquiries are welcome at ${SUPPORT_EMAIL}. You can also read the source or open an issue on GitHub at ${REPO_URL}.`,
        ],
      },
    ],
  },
  contact: {
    metaTitle: 'Contact SVGlo | Support and feedback',
    metaDescription:
      'Contact the SVGlo team by email for support, bug reports, privacy requests, or licensing questions.',
    kicker: 'Contact',
    title: 'Talk to the SVGlo team',
    lead:
      'Send a message about a conversion problem, a privacy request, a bug report, or anything else related to the site.',
    updated: 'Last updated: 19 October 2026',
    sections: [
      {
        id: 'email',
        title: 'Email',
        blocks: [
          `Write to ${SUPPORT_EMAIL}. We aim to reply within a few business days.`,
        ],
      },
      {
        id: 'include',
        title: 'What to include',
        blocks: [
          [
            'The page address and browser you were using.',
            'The image format and approximate dimensions, if the problem is conversion-related.',
            'The preset and settings you selected, and what you expected to see instead.',
          ],
          'Please do not attach confidential artwork. SVGlo never receives your images, and email attachments are stored by the mail provider.',
        ],
      },
      {
        id: 'privacy-requests',
        title: 'Privacy requests',
        blocks: [
          `To ask a question about data handling, or to request deletion of analytics data associated with your visit, email ${SUPPORT_EMAIL} with the subject line "Privacy request". See the privacy policy for the full description of what is collected.`,
        ],
      },
    ],
  },
  privacy: {
    metaTitle: 'Privacy Policy | SVGlo',
    metaDescription:
      'How SVGlo handles images, analytics cookies, and advertising data. Images are processed locally and never uploaded.',
    kicker: 'Privacy',
    title: 'Privacy Policy',
    lead:
      'SVGlo is built around a simple rule: your images stay on your device. This page explains the small amount of data the site does handle, and the choices you have.',
    updated: 'Last updated: 19 October 2026',
    sections: [
      {
        id: 'images',
        title: 'Images and converted files',
        blocks: [
          'Images you select, paste, or drop are decoded and vectorized inside your browser. SVGlo has no upload endpoint, does not store your images or results, and does not keep conversion history. Closing the tab discards the working copy.',
          'Downloads are generated on your device from the SVG markup produced locally. Nothing about the image is sent to SVGlo or to a third party.',
        ],
      },
      {
        id: 'analytics',
        title: 'Analytics',
        blocks: [
          'With your consent, SVGlo uses Google Analytics 4 to understand aggregate site usage, such as which pages are visited and whether the converter completes successfully. Google Analytics may set cookies such as _ga and _ga_4ZEZRGHH7R and collect your IP address, approximate location, device and browser information, and interaction events.',
          'Analytics storage is off by default. When you first visit, a banner asks whether you accept analytics; choosing "Reject analytics" keeps Google Analytics from storing or reading analytics cookies. You can change your choice at any time with the "Cookie settings" link in the footer.',
          'Google processes this data as described at https://policies.google.com/technologies/partner-sites. You can opt out of Google Analytics across all sites with the Google Analytics opt-out browser add-on.',
        ],
      },
      {
        id: 'advertising',
        title: 'Advertising',
        blocks: [
          'SVGlo may display advertising through Google AdSense. When ads are shown, Google and its partners may use cookies, web beacons, IP addresses, and other identifiers to serve and measure ads, including personalized ads based on your prior visits to this and other websites.',
          'Where required, advertising consent is collected before any advertising cookie is set, and the site uses Google Consent Mode so ad and analytics storage stay denied until you agree. You can manage personalized advertising at https://adssettings.google.com and opt out of participating vendors at https://www.aboutads.info.',
        ],
      },
      {
        id: 'third-parties',
        title: 'Service providers',
        blocks: [
          'The site is served by Cloudflare, which processes request metadata such as IP address and user agent to deliver content and protect against abuse. Cloudflare Web Analytics may collect aggregate performance data without cookies.',
          'Google Analytics and Google AdSense are provided by Google LLC. Their handling of data is governed by Google\'s privacy policy at https://policies.google.com/privacy.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and local storage',
        blocks: [
          'SVGlo stores your analytics choice in your browser\'s local storage under the key svglo-analytics-consent. That value stays on your device and is not transmitted.',
          'Analytics and advertising cookies are only set after you consent, except where a cookie is strictly necessary to deliver the page or to record your consent.',
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        blocks: [
          'Depending on where you live, you may have the right to access, correct, delete, or restrict processing of personal data, and to object to processing or withdraw consent. Because SVGlo does not hold images or accounts, most requests concern analytics data.',
          `To exercise a right, or to ask a question about this policy, email ${SUPPORT_EMAIL}. You can also use the "Cookie settings" link in the footer to withdraw analytics consent immediately.`,
        ],
      },
      {
        id: 'children',
        title: 'Children',
        blocks: [
          'SVGlo is a general-audience tool and is not directed at children under 13. The site does not knowingly collect personal information from children.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        blocks: [
          'This policy may be updated when the site changes, for example when advertising is enabled. Material changes will be reflected by the "Last updated" date at the top of this page.',
        ],
      },
    ],
  },
  terms: {
    metaTitle: 'Terms of Use | SVGlo',
    metaDescription:
      'The terms that apply when you use SVGlo, including acceptable use, intellectual property, and disclaimers.',
    kicker: 'Terms',
    title: 'Terms of Use',
    lead:
      'These terms apply to your use of SVGlo. By using the site, you agree to them.',
    updated: 'Last updated: 19 October 2026',
    sections: [
      {
        id: 'service',
        title: 'The service',
        blocks: [
          'SVGlo is a free, browser-based image and SVG conversion tool. It is provided as-is, without a service-level guarantee. Features may change, and the site may be unavailable during maintenance or outages.',
          'No account is required. Conversion runs locally, so availability depends on your browser supporting JavaScript, Canvas, and WebAssembly.',
        ],
      },
      {
        id: 'acceptable-use',
        title: 'Acceptable use',
        blocks: [
          'You may use SVGlo for personal and commercial projects. You are responsible for the files you convert and for having the rights to use them.',
          'Do not use the site to process unlawful material, to infringe copyright or trademarks, to distribute malware, or to attempt to disrupt or overload the service.',
        ],
      },
      {
        id: 'ip',
        title: 'Intellectual property',
        blocks: [
          'You keep all rights to your images and to the files you create. SVGlo claims no ownership over your content.',
          'The SVGlo site, its branding, and its source code are protected by copyright and released under the MIT license where applicable. The converter uses the visioncortex VTracer engine, which is distributed under the MIT or Apache-2.0 license.',
        ],
      },
      {
        id: 'disclaimer',
        title: 'Disclaimer',
        blocks: [
          'SVGlo is provided "as is" and "as available", without warranties of any kind, express or implied, including fitness for a particular purpose. Vectorization is lossy by nature; review output before using it in production.',
          'To the maximum extent permitted by law, the SVGlo contributors are not liable for indirect, incidental, or consequential damages arising from use of the site.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes',
        blocks: [
          `These terms may be updated from time to time. The current version is always published on this page. Questions can be sent to ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
};

const chinesePages: Record<LegalPageId, LegalPageCopy> = {
  about: {
    metaTitle: '关于 SVGlo | 免费的浏览器端图片转 SVG 工具',
    metaDescription:
      '了解 SVGlo 的维护者、浏览器端图片转 SVG 的工作原理，以及为什么图片永远不会离开你的设备。',
    kicker: '关于',
    title: '一个小巧的本地优先矢量工具',
    lead:
      'SVGlo 是一款完全在浏览器中运行的免费图片转 SVG 转换器，目标是让这项常见的设计工作变得快速、私密，并且不需要注册账号。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'what',
        title: 'SVGlo 做什么',
        blocks: [
          'SVGlo 可将 PNG、JPG、JPEG、WebP、GIF 和 BMP 图片转换为干净的 SVG 路径，也能把 SVG 转回 JPG 或 PNG。所有处理都通过 WebAssembly 和 Canvas 在你的设备上完成：没有上传接口，不存储图片，也不需要账号。',
          '本站由 SVGlo 贡献者维护。项目以 MIT 许可证开源，转换器基于 visioncortex VTracer 描摹引擎构建。',
        ],
      },
      {
        id: 'why',
        title: '为什么这样设计',
        blocks: [
          '多数在线转换器会把文件上传到服务器处理，并保留一段时间。这对未发布的徽标、客户素材或受保密协议约束的文件并不合适。本地处理消除了这个取舍：转换能力没有打折，而文件始终不离开你的电脑。',
          '本站仅通过不打扰阅读的广告维持运营，没有付费版本、水印或转换次数限制。广告位（如有）会清晰标注，并且不会遮挡转换器或操作按钮。',
        ],
      },
      {
        id: 'contact',
        title: '联系我们',
        blocks: [
          `问题反馈、缺陷报告和授权咨询请发送至 ${SUPPORT_EMAIL}。你也可以在 GitHub 上阅读源码或提交 issue：${REPO_URL}。`,
        ],
      },
    ],
  },
  contact: {
    metaTitle: '联系 SVGlo | 支持与反馈',
    metaDescription: '通过电子邮件联系 SVGlo 团队，反馈问题、提交缺陷、提出隐私请求或咨询授权。',
    kicker: '联系',
    title: '联系 SVGlo 团队',
    lead: '无论是转换问题、隐私请求、缺陷报告，还是其他与本站相关的事项，都欢迎来信。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'email',
        title: '电子邮件',
        blocks: [`请发送至 ${SUPPORT_EMAIL}。我们通常会在几个工作日内回复。`],
      },
      {
        id: 'include',
        title: '来信请包含',
        blocks: [
          [
            '你使用的页面地址和浏览器。',
            '如果与转换有关，请说明图片格式和大致尺寸。',
            '你选择的预设和参数，以及你期望看到的结果。',
          ],
          '请不要附上保密素材。SVGlo 从不会收到你的图片，而邮件附件会由邮件服务商存储。',
        ],
      },
      {
        id: 'privacy-requests',
        title: '隐私请求',
        blocks: [
          `如需咨询数据处理，或要求删除与你访问相关的分析数据，请发送邮件至 ${SUPPORT_EMAIL}，主题注明“隐私请求”。具体收集内容请参阅隐私政策。`,
        ],
      },
    ],
  },
  privacy: {
    metaTitle: '隐私政策 | SVGlo',
    metaDescription: 'SVGlo 如何处理图片、分析 Cookie 与广告数据。图片在本地处理，从不上传。',
    kicker: '隐私',
    title: '隐私政策',
    lead:
      'SVGlo 遵循一个简单原则：你的图片留在你的设备上。本页说明本站实际处理的少量数据，以及你可以做出的选择。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'images',
        title: '图片与转换结果',
        blocks: [
          '你选择、粘贴或拖入的图片只会在浏览器内解码和矢量化。SVGlo 没有上传接口，不会存储你的图片或转换结果，也不保留转换历史。关闭标签页后，工作副本即被丢弃。',
          '下载文件由本地生成的 SVG 源码在你的设备上创建，图片的任何信息都不会发送给 SVGlo 或第三方。',
        ],
      },
      {
        id: 'analytics',
        title: '统计分析',
        blocks: [
          '在你同意后，SVGlo 使用 Google Analytics 4 了解网站的整体使用情况，例如访问了哪些页面、转换是否成功。Google Analytics 可能设置 _ga、_ga_4ZEZRGHH7R 等 Cookie，并收集 IP 地址、大致位置、设备与浏览器信息以及交互事件。',
          '分析存储默认关闭。首次访问时，横幅会询问你是否接受统计分析；选择“拒绝统计分析”后，Google Analytics 不会存储或读取分析 Cookie。你可以随时通过页脚的“Cookie 设置”更改选择。',
          'Google 对此类数据的处理方式见 https://policies.google.com/technologies/partner-sites。你也可以安装 Google Analytics 停用浏览器插件，在所有网站上退出统计。',
        ],
      },
      {
        id: 'advertising',
        title: '广告',
        blocks: [
          'SVGlo 可能通过 Google AdSense 展示广告。展示广告时，Google 及其合作伙伴可能使用 Cookie、网络信标、IP 地址和其他标识符来投放和衡量广告，包括基于你此前访问本网站和其他网站的个性化广告。',
          '在适用法律要求的地区，网站会在设置任何广告 Cookie 之前征求同意，并使用 Google Consent Mode，使广告与分析存储在获得同意前保持拒绝状态。你可以在 https://adssettings.google.com 管理个性化广告，并在 https://www.aboutads.info 退出参与供应商的个性化广告。',
        ],
      },
      {
        id: 'third-parties',
        title: '服务提供商',
        blocks: [
          '本站由 Cloudflare 提供托管与加速服务，其会处理 IP 地址、User-Agent 等请求元数据，用于分发内容和防御滥用。Cloudflare Web Analytics 可能在不使用 Cookie 的情况下收集汇总性能数据。',
          'Google Analytics 与 Google AdSense 由 Google LLC 提供，其数据处理受 https://policies.google.com/privacy 约束。',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookie 与本地存储',
        blocks: [
          'SVGlo 会将你的分析选择保存在浏览器本地存储的 svglo-analytics-consent 键中。该值只保留在你的设备上，不会被传输。',
          '除交付页面或记录同意状态所必需的 Cookie 外，分析 Cookie 与广告 Cookie 仅在你同意后设置。',
        ],
      },
      {
        id: 'rights',
        title: '你的权利',
        blocks: [
          '根据你所在地区的法律，你可能有权访问、更正、删除或限制处理个人数据，也有权反对处理或撤回同意。由于 SVGlo 不保存图片或账号，多数请求涉及的是分析数据。',
          `如需行使上述权利，或对本政策有疑问，请发送邮件至 ${SUPPORT_EMAIL}。你也可以立即使用页脚的“Cookie 设置”撤回分析同意。`,
        ],
      },
      {
        id: 'children',
        title: '儿童',
        blocks: [
          'SVGlo 是面向一般用户的工具，不面向 13 岁以下儿童，也不会在知情情况下收集儿童的个人信息。',
        ],
      },
      {
        id: 'changes',
        title: '政策变更',
        blocks: [
          '当网站发生变化（例如启用广告）时，本政策可能会更新。重大变更会通过页面顶部的“最后更新”日期体现。',
        ],
      },
    ],
  },
  terms: {
    metaTitle: '使用条款 | SVGlo',
    metaDescription: '使用 SVGlo 时适用的条款，包括可接受使用、知识产权与免责声明。',
    kicker: '条款',
    title: '使用条款',
    lead: '以下条款适用于你对 SVGlo 的使用。使用本站即表示你同意这些条款。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'service',
        title: '服务说明',
        blocks: [
          'SVGlo 是一款免费的浏览器端图片与 SVG 转换工具，按现状提供，不附带服务等级保证。功能可能调整，网站也可能在维护或故障期间不可用。',
          '使用本站无需账号。转换在本地运行，因此可用性取决于你的浏览器是否支持 JavaScript、Canvas 和 WebAssembly。',
        ],
      },
      {
        id: 'acceptable-use',
        title: '可接受使用',
        blocks: [
          '你可以将 SVGlo 用于个人或商业项目。你需要对自己转换的文件负责，并确保拥有使用这些文件的权利。',
          '请勿使用本站处理违法内容、侵犯版权或商标、传播恶意软件，或试图破坏、过载本服务。',
        ],
      },
      {
        id: 'ip',
        title: '知识产权',
        blocks: [
          '你保留对自己图片和所生成文件的全部权利。SVGlo 不对你的内容主张任何所有权。',
          'SVGlo 网站、品牌与源代码受版权保护，适用部分以 MIT 许可证发布。转换器使用 visioncortex VTracer 引擎，该引擎以 MIT 或 Apache-2.0 许可证分发。',
        ],
      },
      {
        id: 'disclaimer',
        title: '免责声明',
        blocks: [
          'SVGlo 按“现状”和“可用”状态提供，不作任何明示或暗示的保证，包括对特定用途适用性的保证。矢量化本身是有损的，请在生产使用前检查输出结果。',
          '在法律允许的最大范围内，SVGlo 贡献者不对因使用本站产生的间接、附带或后果性损害承担责任。',
        ],
      },
      {
        id: 'changes',
        title: '条款变更',
        blocks: [
          `本条款可能不时更新，当前版本始终发布在本页面。如有疑问，请联系 ${SUPPORT_EMAIL}。`,
        ],
      },
    ],
  },
};

export const legalPages: Record<Locale, Record<LegalPageId, LegalPageCopy>> = {
  en: englishPages,
  'zh-CN': chinesePages,
};
