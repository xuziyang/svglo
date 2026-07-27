export interface PresetMessages {
  name: string;
  description: string;
}

export interface Messages {
  meta: {
    title: string;
    description: string;
  };
  header: {
    tagline: string;
    newImage: string;
  };
  hero: {
    titleBefore: string;
    titleAccent: string;
    lead: string;
    featLocal: string;
    featModes: string;
    featParams: string;
    featExport: string;
  };
  dropzone: {
    title: string;
    formats: string;
    hint: string;
    aria: string;
    unsupported: string;
    tooLarge: string;
    tooManyPixels: string;
    unreadable: string;
    tryExample: string;
    exampleName: string;
  };
  presets: {
    default: PresetMessages;
    bw: PresetMessages;
    poster: PresetMessages;
    photo: PresetMessages;
    pixel: PresetMessages;
  };
  controls: {
    presets: string;
    clustering: string;
    colorMode: string;
    colorModeColor: string;
    colorModeBinary: string;
    colorHint: string;
    binaryHint: string;
    hierarchy: string;
    hierarchyStacked: string;
    hierarchyCutout: string;
    stackedHint: string;
    cutoutHint: string;
    filterSpeckle: string;
    filterSpeckleHint: string;
    colorPrecision: string;
    colorPrecisionHint: string;
    gradientStep: string;
    gradientStepHint: string;
    curveFitting: string;
    mode: string;
    modeSpline: string;
    modePolygon: string;
    modePixel: string;
    cornerThreshold: string;
    cornerThresholdHint: string;
    segmentLength: string;
    segmentLengthHint: string;
    spliceThreshold: string;
    spliceThresholdHint: string;
    pathPrecision: string;
    pathPrecisionHint: string;
  };
  preview: {
    original: string;
    vector: string;
    compare: string;
    copy: string;
    copied: string;
    copyTitle: string;
    download: string;
    vectorizing: string;
    failed: string;
    failedHint: string;
    retry: string;
    chooseAnother: string;
    empty: string;
    size: string;
    originalAlt: string;
  };
  footer: {
    privacyTitle: string;
    privacySummary: string;
    privacyBody: string;
    privacy: string;
    copyright: string;
    close: string;
  };
  notFound: {
    metaTitle: string;
    metaDescription: string;
    code: string;
    title: string;
    lead: string;
    home: string;
  };
}

/** Dot-path keys into Messages, e.g. "header.tagline" */
export type MessageKey = JoinKeys<Messages>;

type JoinKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? Prefix extends ''
      ? K
      : `${Prefix}.${K}`
    : T[K] extends object
      ? JoinKeys<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
      : never;
}[keyof T & string];
