export const en = {
  nav: {
    playground: 'Playground',
    agentkit: 'AgentKit',
    mcp: 'MCP',
    apiDocs: 'API Docs'
  },
  hero: {
    badge: 'Now live on Base 🔵',
    titleLine1: 'Automated A&R for the',
    titleHighlight: 'new music economy.',
    subtitle: 'Neural networks that listen, analyze, and categorize tracks in 20 seconds. Pay-per-use via the',
    subtitleHighlight: 'x402 protocol',
    testButton: 'Test the Analyzer',
    devButton: 'For Developers'
  },
  story: {
    quote: '"The A&R process is broken. We fixed it."',
    content: 'As an artist, I sent countless demos into the void. As a label co-founder, I realized why: the listening bottleneck. Tag-per-Track isn\'t just a tool; it\'s a technical solution to a broken system, built by a musician to unblock the industry.'
  },
  playground: {
    title: 'Tag-per-Track',
    subtitle: 'Agentic-First Musical Audio Analysis',
    sectionTitle: 'Try it yourself',
    sectionDescription: 'Drop an audio file below. Connect your wallet on',
    sectionDescriptionHighlight: 'Base',
    sectionDescriptionEnd: 'to settle the x402 micro-payment (0.05 USDC). Every signature and analysis is executed in real-time on-chain.',
    connectWallet: 'Connect Wallet',
    disconnect: 'Disconnect',
    dropTitle: 'Drop your sound',
    dropSubtitle: 'or click to browse local files',
    or: 'OR',
    urlPlaceholder: 'Paste a remote audio URL...',
    targetUrl: 'Target URL',
    clearUrl: 'Clear URL',
    readyForTagging: 'Ready for neural tagging',
    removeTrack: 'Remove track',
    extractLyrics: 'Extract Lyrics',
    lyricsPrice: '(0.10 USDC)',
    btnAnalyze: 'Analyze Track',
    btnSignAndAnalyze: 'Sign & Analyze',
    btnWorking: 'Working...',
    analyzeAnother: 'Analyze another track',
    paymentValidated: 'Payment Validated',
    viewOnBasescan: 'VIEW ON BASESCAN',
    taggingInProgress: 'Tagging in progress...',
    taggingDescription: 'Neural processing usually takes ~20 seconds. Extracting BPM, key, and genres.',
    invoice: {
      title: 'Payment Required',
      subtitle: 'Micro-payment via Coinbase CDP (USDC)',
      amount: 'Amount',
      network: 'Network',
      destination: 'Destination',
      signButton: 'Sign & Settle with x402'
    },
    steps: {
      fetching: '📡 Fetching audio track...',
      paymentVerified: '🧠 Payment verified! Neural listening and analysis in progress...',
      awaitingSignature: '✍️ Awaiting your Web3 signature (Gasless)...'
    },
    errors: {
      invalidFile: 'Please select a valid audio file (mp3, wav, ogg, etc.).',
      invalidUrl: 'Please enter a valid URL (including http:// or https://).',
      unsupportedDomain: 'Direct analysis of {domain} is not supported. Please provide a direct link to a raw audio file.',
      webpageNotAudio: 'The link seems to point to a webpage, not an audio file.',
      selectFileOrUrl: 'Please select a file or enter an audio URL.',
      couldNotConnect: 'Could not connect wallet.',
      paymentFailed: 'Payment failed or was cancelled.',
      genericAnalysisError: 'Analysis failed. Please verify the URL and try again.'
    }
  },
  result: {
    title: 'Audio Intelligence',
    tabVibe: 'Vibe',
    tabLyrics: 'Lyrics',
    tempo: 'Tempo (BPM)',
    key: 'Musical Key',
    genres: 'Detected Genres',
    dominantMood: 'Dominant Mood',
    lowConfidence: 'Low Confidence',
    highConfidence: 'High Confidence',
    instrumentation: 'Instrumentation',
    copyLyrics: 'Copy Lyrics',
    unknown: 'Unknown'
  },
  dev: {
    title: 'Integrate Tag-per-Track',
    subtitle: 'Choose the best way to empower your AI agents with advanced music intelligence.',
    sdk: {
      badge: 'For JS Developers',
      title: 'Give your AI Agent ears.',
      description: 'The tag-per-track-agentkit SDK integrates natively with LangChain and handles the x402 payment flow automatically. Enable your agents to evaluate music on-chain with zero friction.',
      features: [
        'Automatic x402 challenge resolution',
        'EIP-712 payment proof generation',
        'Seamless music metadata extraction'
      ],
      terminalTitle: 'SDK Installation',
      comment: '# Payment logic handled internally via Coinbase CDP'
    },
    mcp: {
      badge: 'For LLM Users',
      title: 'Autonomous "Pay-to-Listen"',
      description: 'Enable your local LLMs (Claude Desktop, etc.) to analyze music autonomously. The Tag-per-Track MCP Server handles the x402 payment protocol on-chain without user intervention.',
      toolAnalyzeTitle: 'analyze_audio',
      toolAnalyzeDesc: 'Tool to extract BPM, Key, Mood and Genre from any URL.',
      toolX402Title: 'x402 Built-in',
      toolX402Desc: 'Automated EIP-3009 signing for USDC on Base.',
      badgeVersion: 'MCP V1.0',
      badgeNpm: 'Now available on NPM',
      copyConfig: 'Copy Config',
      copied: 'Copied!'
    }
  },
  footer: {
    builtOn: 'Built on Base. Built for Music.'
  },
  scales: {
    minor: 'minor',
    major: 'major'
  }
};
