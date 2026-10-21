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
const LEGAL_PATH_RE = new RegExp(`^(?:/zh-cn)?/(${LEGAL_PAGE_IDS.join('|')})$`);

export function legalPageFromPath(pathname: string): LegalPageId | null {
  const id = pathname.match(LEGAL_PATH_RE)?.[1];
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
    updated: 'Last updated: 21 October 2026',
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
          'Analytics storage is off by default. When you first visit, a banner asks for one combined choice: "Accept all" allows Google Analytics cookies, while "Reject all" keeps Google Analytics from storing or reading analytics cookies. You can change your choice at any time with the "Cookie settings" link in the footer.',
          'Google processes this data as described at https://policies.google.com/technologies/partner-sites. You can opt out of Google Analytics across all sites with the Google Analytics opt-out browser add-on.',
        ],
      },
      {
        id: 'advertising',
        title: 'Advertising',
        blocks: [
          'SVGlo may display advertising through Google AdSense. When ads are shown, Google and its partners may use cookies, web beacons, IP addresses, and other identifiers to serve and measure ads, including personalized ads based on your prior visits to this and other websites.',
          'The cookie banner collects this choice before any advertising cookie is set, using Google Consent Mode. "Accept all" enables advertising cookies and personalized ads; "Reject all" keeps advertising cookies off, in which case Google may still serve cookie-free limited ads. You can change the choice anytime with the "Cookie settings" link in the footer, manage personalized advertising at https://adssettings.google.com, and opt out of participating vendors at https://www.aboutads.info.',
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
          'SVGlo stores your cookie choice (analytics and advertising) in your browser\'s local storage under the key svglo-analytics-consent. That value stays on your device and is not transmitted.',
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
    kicker: '关于我们',
    title: '轻量、本地优先的矢量工具',
    lead:
      'SVGlo 是一款完全在浏览器端运行的免费图片转 SVG 工具，致力于让日常设计中的矢量转换更快速、私密且无繁琐账号门槛。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'what',
        title: '产品定位与核心功能',
        blocks: [
          'SVGlo 支持将 PNG、JPG、JPEG、WebP、GIF 和 BMP 等常见图片快速转换为规范整洁的 SVG 矢量路径，同时也支持将 SVG 图形转回 JPG 或 PNG 位图。所有运算均借助 WebAssembly 和 Canvas 在你的本地设备上高效完成：没有服务器上传接口，不存储任何图片，更无需注册账号。',
          '本站由 SVGlo 开源贡献者维护。项目遵循 MIT 开源许可协议，核心矢量化能力基于 visioncortex VTracer 引擎构建。',
        ],
      },
      {
        id: 'why',
        title: '设计理念与初衷',
        blocks: [
          '多数传统在线转换工具都会将用户文件上传至远端服务器进行处理，并在云端保留一段时间。对于未公开的品牌 Logo、客户设计稿或受保密协议保护的文件而言，这存在明显的合规与隐私风险。SVGlo 采用纯前端本地计算，彻底解决了这一痛点：在具备完整专业转换能力的同时，确保源文件始终不离开你的本地设备。',
          '本站仅依托极简、不打扰操作的广告来维持日常服务器与带宽成本，不存在付费门槛、强制水印或转换配额限制。广告展示（如有）均会有清晰标注，绝不会遮挡转换界面与控制面板。',
        ],
      },
      {
        id: 'contact',
        title: '联系我们',
        blocks: [
          `问题反馈、缺陷报告与授权咨询欢迎发送邮件至 ${SUPPORT_EMAIL}。你也可以在 GitHub 上查阅源代码或提交 Issue：${REPO_URL}。`,
        ],
      },
    ],
  },
  contact: {
    metaTitle: '联系 SVGlo | 支持与反馈',
    metaDescription: '通过电子邮件联系 SVGlo 团队，反馈问题、提交缺陷、提出隐私请求或咨询授权。',
    kicker: '联系我们',
    title: '联系 SVGlo 团队',
    lead: '无论是转换问题反馈、隐私相关请求、缺陷报告，还是其他与本站相关的事项，都欢迎与我们联系。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'email',
        title: '电子邮箱',
        blocks: [`来信请发送至 ${SUPPORT_EMAIL}。我们通常会在几个工作日内予以回复。`],
      },
      {
        id: 'include',
        title: '建议包含的信息',
        blocks: [
          [
            '你遇到问题时的页面 URL 地址与所使用的浏览器版本。',
            '若与图片转换效果相关，请说明原始图片格式与大致像素尺寸。',
            '你所选用的预设与参数设置，以及你期望获得的效果。',
          ],
          '请不要在邮件中附带机密设计素材。SVGlo 网站本身绝不收集你的图片，但邮件附件会被邮件服务提供商存储。',
        ],
      },
      {
        id: 'privacy-requests',
        title: '隐私相关请求',
        blocks: [
          `如需咨询数据合规处理，或申请删除与你访问相关的分析统计数据，请发送邮件至 ${SUPPORT_EMAIL}，并在主题注明“隐私请求”。具体数据收集范围请查阅隐私政策。`,
        ],
      },
    ],
  },
  privacy: {
    metaTitle: '隐私政策 | SVGlo',
    metaDescription: 'SVGlo 如何处理图片、分析 Cookie 与广告数据。图片在本地处理，从不上传。',
    kicker: '隐私政策',
    title: '隐私政策',
    lead:
      'SVGlo 遵循一个简单原则：你的图片留在你的设备上。本页说明本站实际处理的少量数据，以及你可以做出的选择。',
    updated: '最后更新：2026 年 10 月 21 日',
    sections: [
      {
        id: 'images',
        title: '图片与转换数据',
        blocks: [
          '你所拖入、粘贴或选取的图片仅在浏览器沙箱内完成解码与矢量化运算。SVGlo 没有云端上传接口，不会持久化存储你的源图片或转换结果，亦不记录任何转换历史。一旦关闭当前网页标签，所有工作缓存将立即彻底销毁。',
          '导出的 SVG 或位图文件直接基于本地内存生成并触发下载，图片的任何像素信息都不会发送给 SVGlo 或任何第三方机构。',
        ],
      },
      {
        id: 'analytics',
        title: '访问统计与分析',
        blocks: [
          '在你同意后，SVGlo 使用 Google Analytics 4 了解网站的整体使用情况，例如访问了哪些页面、转换是否成功。Google Analytics 可能设置 _ga、_ga_4ZEZRGHH7R 等 Cookie，并收集 IP 地址、大致位置、设备与浏览器信息以及交互事件。',
          '分析存储默认关闭。首次访问时，横幅以一个统一选择征求同意：选择“全部接受”会允许 Google Analytics Cookie；选择“全部拒绝”后，Google Analytics 不会存储或读取分析 Cookie。你可以随时通过页脚的“Cookie 设置”更改选择。',
          'Google 对此类数据的处理方式见 https://policies.google.com/technologies/partner-sites。你也可以安装 Google Analytics 停用浏览器插件，在所有网站上退出统计。',
        ],
      },
      {
        id: 'advertising',
        title: '广告投放',
        blocks: [
          'SVGlo 可能通过 Google AdSense 展示广告。展示广告时，Google 及其合作伙伴可能使用 Cookie、网络信标、IP 地址和其他标识符来投放和衡量广告，包括基于你此前访问本网站和其他网站的个性化广告。',
          '网站通过 Google Consent Mode 在设置任何广告 Cookie 之前收集这一选择。选择“全部接受”会启用广告 Cookie 和个性化广告；选择“全部拒绝”会关闭广告 Cookie，此时 Google 仍可能展示不使用 Cookie 的有限广告。你可以随时通过页脚的“Cookie 设置”更改选择，在 https://adssettings.google.com 管理个性化广告，并在 https://www.aboutads.info 退出参与供应商的个性化广告。',
        ],
      },
      {
        id: 'third-parties',
        title: '第三方服务提供商',
        blocks: [
          '本站由 Cloudflare 提供托管与加速服务，其会处理 IP 地址、User-Agent 等请求元数据，用于分发内容和防御滥用。Cloudflare Web Analytics 可能在不使用 Cookie 的情况下收集汇总性能数据。',
          'Google Analytics 与 Google AdSense 由 Google LLC 提供，其数据处理受 https://policies.google.com/privacy 约束。',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookie 与本地缓存',
        blocks: [
          'SVGlo 会将你的 Cookie 选择（统计与广告）保存在浏览器本地存储的 svglo-analytics-consent 键中。该值只保留在你的设备上，不会被传输。',
          '除交付页面或记录同意状态所必需的 Cookie 外，分析 Cookie 与广告 Cookie 仅在你同意后设置。',
        ],
      },
      {
        id: 'rights',
        title: '你的权利',
        blocks: [
          '根据你所在国家或地区的法律法规，你可能拥有访问、更正、删除或限制处理个人数据的权利，亦有权拒绝处理或撤回授权同意。由于 SVGlo 本身不储存任何用户图片或账号信息，绝大多数请求通常仅涉及匿名统计数据。',
          `如需行使上述权利，或对本政策有疑问，请发送邮件至 ${SUPPORT_EMAIL}。你也可以随时点击页脚的“Cookie 设置”撤回分析授权。`,
        ],
      },
      {
        id: 'children',
        title: '未成年人保护',
        blocks: [
          'SVGlo 是面向一般受众的工具，不面向 13 周岁以下儿童，也不会在知情情况下收集儿童的个人信息。',
        ],
      },
      {
        id: 'changes',
        title: '政策变更',
        blocks: [
          '当网站功能发生变更（例如启用新服务）时，本政策可能会适时修订。重大变更将通过页面顶部的“最后更新”日期明确标识。',
        ],
      },
    ],
  },
  terms: {
    metaTitle: '使用条款 | SVGlo',
    metaDescription: '使用 SVGlo 时适用的条款，包括使用准则、知识产权归属与免责声明。',
    kicker: '使用条款',
    title: '使用条款',
    lead: '以下使用条款适用于你对 SVGlo 网站及服务的访问与使用。使用本站即代表你知悉并同意本条款。',
    updated: '最后更新：2026 年 10 月 19 日',
    sections: [
      {
        id: 'service',
        title: '服务说明',
        blocks: [
          'SVGlo 是一款免费的浏览器端图片与 SVG 转换工具，按“现状”提供，不承诺特定的服务等级保证（SLA）。工具功能可能会适时优化更新，网站亦可能在服务器维护或网络故障期间出现暂时不可用。',
          '使用本站无需注册账号。转换全流程在本地浏览器中运行，因此其可用性取决于你的浏览器是否正常支持 JavaScript、Canvas 和 WebAssembly。',
        ],
      },
      {
        id: 'acceptable-use',
        title: '使用规范与合规要求',
        blocks: [
          '你可以将 SVGlo 自由用于个人学习或商业项目。你需要对自己转换的文件内容及其合法性负责，并确保拥有使用相应素材的合法权利或授权。',
          '请勿利用本站处理任何违反法律法规的内容，不得侵犯他人的著作权、商标权等合法权益，亦不得利用本站传播恶意软件或蓄意攻击、破坏站点的正常运行。',
        ],
      },
      {
        id: 'ip',
        title: '知识产权归属',
        blocks: [
          '你保留对自身原始图片及转换生成文件的全部知识产权与所有权，SVGlo 不对你的任何创作内容主张任何权利。',
          'SVGlo 网站界面设计、品牌标识及源代码受版权法保护，适用部分根据 MIT 开源许可协议发布。图像矢量化转换引擎基于 visioncortex VTracer 构建，该引擎依据 MIT 或 Apache-2.0 许可证分发。',
        ],
      },
      {
        id: 'disclaimer',
        title: '免责声明',
        blocks: [
          'SVGlo 按“现状”及“现有可用”的基础提供服务，不包含任何明示或暗示的保证，包括但不限于对特定商业用途的适用性保证。由于位图矢量化在算法原理上具有近似有损特性，请务必在投入正式生产或印刷前仔细核验输出效果。',
          '在法律允许的最大范围内，SVGlo 开发者与开源贡献者不对因使用本站产生的任何间接、附带或后果性损失承担法律责任。',
        ],
      },
      {
        id: 'changes',
        title: '条款变更',
        blocks: [
          `本条款可能会不时更新，最新版本将始终发布在本页面上。如有任何疑问，请联系 ${SUPPORT_EMAIL}。`,
        ],
      },
    ],
  },
};

export const legalPages: Record<Locale, Record<LegalPageId, LegalPageCopy>> = {
  en: englishPages,
  'zh-CN': chinesePages,
};
