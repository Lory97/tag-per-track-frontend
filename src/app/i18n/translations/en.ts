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
    subtitle: 'Neural networks that listen, analyze, and categorize tracks in 20 seconds, combined with live streaming traction scoring. Pay-per-use via the',
    subtitleHighlight: 'x402 protocol',
    testButton: 'Test the Analyzer',
    devButton: 'For Developers'
  },
  story: {
    quote: '"The A&R process is broken. We fixed it."',
    content: 'As an artist, I sent countless demos into the void. As a label co-founder, I realized why: the listening bottleneck. Tag-per-Track isn\'t just a tool; it\'s a technical solution to a broken system, built by a musician to unblock the industry by fusing AI acoustic intelligence with real-time streaming traction.'
  },
  playground: {
    title: 'Tag-per-Track',
    subtitle: 'Agentic-First Musical Audio Analysis & A&R Scoring',
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
    artistInputLabel: 'Artist (Hybrid A&R Scoring)',
    artistInputPlaceholder: 'e.g., Daft Punk, Kaytranada, The Blaze...',
    artistInputHint: 'Enriches acoustic analysis with Spotify streaming traction & A&R recommendations',
    extractLyrics: 'Extract Lyrics',
    lyricsPrice: '(0.10 USDC)',
    btnAnalyze: 'Analyze Track',
    btnSignAndAnalyze: 'Sign & Analyze',
    btnWorking: 'Working...',
    analyzeAnother: 'Analyze another track',
    paymentValidated: 'Payment Validated',
    viewOnBasescan: 'VIEW ON BASESCAN',
    taggingInProgress: 'Tagging in progress...',
    taggingDescription: 'Neural processing usually takes ~20 seconds. Extracting BPM, key, genres and artist traction.',
    invoice: {
      title: 'Payment Required',
      subtitle: 'Micro-payment via Coinbase CDP (USDC)',
      amount: 'Amount',
      network: 'Network',
      destination: 'Destination',
      signButton: 'Sign & Settle with x402'
    },
    steps: {
      fetching: '📡 Fetching audio track & artist traction...',
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
    title: 'Music Intelligence',
    tabAr: 'Hybrid A&R Scoring',
    tabVibe: 'Vibe & Style',
    tabLyrics: 'Lyrics',
    tempo: 'Tempo (BPM)',
    key: 'Musical Key',
    genres: 'Detected Genres',
    dominantMood: 'Dominant Mood',
    lowConfidence: 'Low Confidence',
    highConfidence: 'High Confidence',
    instrumentation: 'Instrumentation',
    copyLyrics: 'Copy Lyrics',
    unknown: 'Unknown',
    arScoreTitle: 'Hybrid A&R Score',
    arScoreSubtitle: 'Composite synthesis of acoustic qualities & Spotify streaming traction',
    streamTraction: 'Spotify Streaming Traction',
    monthlyListeners: 'Monthly Listeners',
    followers: 'Followers',
    popularity: 'Popularity Score',
    spotifyProfile: 'Spotify Profile',
    viewProfile: 'View on Spotify',
    sourceCache: '24h Cache',
    sourceLive: 'Live Spotify',
    strategicRecommendation: 'A&R Strategic Recommendation',
    artistClassification: 'Artist Tier',
    searchAnotherArtist: 'Change or test another artist:',
    searchBtn: 'Search',
    searchPlaceholder: 'Artist name...',
    artistNotFound: 'Artist not found on Spotify',
    searchingArtist: 'Searching artist metrics...',
    arMatrixTitle: 'Unified A&R Evaluation Matrix',
    colTrack: 'Track / File',
    colArtist: 'Artist',
    colBpmKey: 'BPM & Key',
    colStyle: 'Style & Mood',
    colTraction: 'Streaming Traction',
    colDecision: 'A&R Decision',
    tiers: {
      established: 'Established / Mainstream Artist',
      rising: 'High-Growth Rising Talent',
      emerging: 'Emerging Gem (High Potential)',
      early: 'Early Development Stage'
    },
    badges: {
      viral: 'Viral & Radio Ready Potential',
      strong: 'Strong Market Traction',
      niche: 'Curated Editorial & Niche Gem',
      developing: 'Initial Development Phase'
    }
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
      title: 'Autonomous Pay-to-Listen & Hybrid A&R',
      description: 'Enable your local LLMs (Claude Desktop, etc.) to analyze music and qualify artist traction autonomously using Tag-per-Track MCP tools.',
      toolAnalyzeTitle: 'analyze_audio',
      toolAnalyzeDesc: 'Tool to extract BPM, Key, Mood and Genre from audio via Essentia (x402).',
      toolBatchTitle: 'analyze_audio_batch',
      toolBatchDesc: 'Parallel batch audio analysis for multiple tracks with resilient reporting.',
      toolArtistStatsTitle: 'lookup_artist_stats',
      toolArtistStatsDesc: 'Live Spotify metrics (monthly listeners, popularity, followers) for A&R qualification.',
      toolX402Title: 'x402 Built-in',
      toolX402Desc: 'Automated EIP-3009 signing for USDC on Base.',
      badgeVersion: 'MCP V1.2.4',
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
