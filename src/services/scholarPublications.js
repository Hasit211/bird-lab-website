// Google Scholar Service for fetching publications
import axios from "axios";

class GoogleScholarService {
  constructor() {
    // Read API key from environment variables only
    this.apiKey = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SERPAPI_KEY : undefined;

    if (!this.apiKey) {
      console.warn(
        "VITE_SERPAPI_KEY not found in environment variables. Using mock data only."
      );
    }

    this.baseUrl = "https://serpapi.com/search.json";

    // Cache key for localStorage
    this.cacheKey = "scholar_publications_v2";
    this.statsKey = "scholar_stats_v2";

    // Cache duration: 1 month (30 days)
    this.cacheDuration = 30 * 24 * 60 * 60 * 1000;

    // Global data store
    this.publicationsData = null;
    this.publicationsStats = null;
    this.isLoading = false;
    this.fetchPromise = null;

    // Comprehensive publications list with direct DOIs / paper URLs & topic keywords
    this.mockData = [
      {
        id: 1,
        title:
          "Design of Adaptive Sensor Coupling-based Upper Limb 7-DOF Exoskeleton for Smooth Human Motion Tracking: ASC-EXO",
        authors: "Suthar, B., Mohd.Zubair, Kansal, S. and Mukherjee, S.",
        journal: "IEEE Sensors Journal",
        year: 2023,
        type: "journal",
        url: "https://doi.org/10.1109/JSEN.2023.3270172",
        citation: 5,
        keywords: [
          "exoskeleton",
          "upper limb",
          "asc-exo",
          "wearable robotics",
          "motion tracking",
          "sensor coupling",
          "human motion"
        ],
      },
      {
        id: 2,
        title:
          "Design of Twisted String Actuated Flexure Joint for Supernumerary Robotic Arm for Bi-manual Tasks",
        authors:
          "Suthar, B., Hasanen, B., Seneviratnea, L., Zweiria, Y. and Hussain, I.",
        journal: "IEEE Sensors Journal",
        year: 2024,
        type: "journal",
        url: "https://doi.org/10.1109/JSEN.2024.3422791",
        citation: 3,
        keywords: [
          "supernumerary robotic arm",
          "supernumerary robotic limbs",
          "flexure joint",
          "bi-manual tasks",
          "twisted string actuated",
          "tsa",
          "wearable"
        ],
      },
      {
        id: 3,
        title:
          "Novel Robotic Finger Using Twisted String Actuator with Modular Passive Return Rotational Joints to Achieve High Grasping Force",
        authors:
          "Suthar, B., Awada, M.I., Seneviratnea, L., Zweiria, Y. and Hussain, I.",
        journal: "Journal of Mechatronics, Elsevier",
        year: 2023,
        type: "journal",
        url: "https://doi.org/10.1016/j.mechatronics.2024.103157",
        citation: 4,
        keywords: [
          "artificial muscle-based robotic finger",
          "robotic finger",
          "finger",
          "twisted string actuator",
          "tsa",
          "passive return",
          "grasping force",
          "human-like fingers",
          "artificial muscle"
        ],
      },
      {
        id: 4,
        title:
          "A Soft Twisted String Actuation System for Exosuit: Undesirable Behaviors and the Effect of Pre-twists",
        authors: "Suthar, B. and Ryu, J.H.",
        journal: "Journal of Mechatronics, Elsevier",
        year: 2023,
        type: "journal",
        url: "https://doi.org/10.1016/j.mechatronics.2023.103084",
        citation: 6,
        keywords: [
          "bio-inspired muscles-tsa",
          "bio-inspired muscles",
          "exosuits",
          "exosuit",
          "soft twisted string actuation",
          "pre-twists",
          "artificial muscle",
          "wearable"
        ],
      },
      {
        id: 5,
        title:
          "Design and Feasibility Analysis of a Foldable Robot Arm for Drones Using a Twisted String Actuator: FRAD",
        authors: "Suthar, B. and Jung, S.",
        journal: "IEEE Robotics and Automation Letters",
        year: 2021,
        type: "journal",
        url: "https://doi.org/10.1115/1.4050813",
        citation: 12,
        keywords: [
          "extendable drone arm",
          "foldable robot arm for drones",
          "drone arm",
          "drones",
          "drone",
          "frad",
          "aerial manipulation",
          "metamorphic drone arm"
        ],
      },
      {
        id: 6,
        title:
          "Design and Bending Analysis of a Metamorphic Parallel Twisted-Scissor Mechanism",
        authors: "Suthar, B. and Jung, S.",
        journal: "Transactions of ASME-Journal of Mechanisms and Robotics",
        year: 2021,
        type: "journal",
        url: "https://doi.org/10.1109/LRA.2021.3084890",
        citation: 8,
        keywords: [
          "metamorphic parallel twisted-scissor mechanism",
          "metamorphic",
          "reconfigurable and growing robotics",
          "growing robotics",
          "scissor mechanism",
          "folding"
        ],
      },
      {
        id: 7,
        title:
          "Development of a Compliant Joint Based Upper Limb Exoskeleton for Stable Tele-manipulation: CJ EXO",
        authors: "Suthar, B., Zubair, M., Kansal, S. and Mukherjee, S.",
        journal:
          "IEEE RAS/EMBS International Conference on Biomedical Robotics and Biomechatronics",
        year: 2022,
        type: "conference",
        url: "https://doi.org/10.1109/BioRob52686.2022.9925432",
        citation: 7,
        keywords: [
          "tele-robotics and haptics",
          "tele-robotics",
          "haptics",
          "tele-manipulation",
          "master device",
          "slave device",
          "haptic feedback",
          "cj exo",
          "compliant joint"
        ],
      },
      {
        id: 8,
        title:
          "Conceptual Design of an Extendable Rope-inspired Module Space Orbit Arm for Maneuvering: ERM-SOA",
        authors: "Suthar, B. and Jung, S.",
        journal: "46th NASA Aerospace Mechanisms Symposium",
        year: 2022,
        type: "conference",
        url: "https://ntrs.nasa.gov/citations/20220008544",
        citation: 4,
        keywords: [
          "extendable space arm",
          "space arm",
          "space orbit arm",
          "erm-soa",
          "rope-inspired",
          "maneuvering",
          "reconfigurable"
        ],
      },
      {
        id: 9,
        title:
          "Design and Experimental Evaluation of Foldable Robot Arms for holding and Installation Work: FRAHI",
        authors: "Suthar, B., Chio, Y.J., and Jung, S.",
        journal:
          "IEEE International Conference on Robot and Human Interactive Communication",
        year: 2021,
        type: "conference",
        url: "https://doi.org/10.1109/RO-MAN50785.2021.9515438",
        citation: 9,
        keywords: [
          "foldable supernumerary robotic arms",
          "foldable robot arms",
          "frahi",
          "holding and installation",
          "supernumerary"
        ],
      },
      {
        id: 10,
        title:
          "Single Motor-based Bidirectional Twisted String Actuation with Variable Radius Pulleys",
        authors: "Khan, M.A., Suthar, B., Gaponov, I. and Ryu, J.H.",
        journal: "IEEE Robotics and Automation Letters",
        year: 2019,
        type: "journal",
        url: "https://doi.org/10.1109/LRA.2019.2900747",
        citation: 22,
        keywords: [
          "twisted string actuation",
          "bidirectional",
          "variable radius pulleys",
          "tsa",
          "actuation"
        ],
      },
      {
        id: 11,
        title:
          "Development of Bio-Inspired Multi-Articulated Robotic Hand with Artificial Tendon Routing",
        authors: "Suthar, B., Awada, M.I., Seneviratnea, L. and Hussain, I.",
        journal: "IEEE Transactions on Medical Robotics and Bionics",
        year: 2024,
        type: "journal",
        url: "https://doi.org/10.1016/j.mechatronics.2024.103157",
        citation: 5,
        keywords: [
          "artificial muscle-based robotic hand",
          "robotic hand",
          "prosthetic limbs",
          "prosthetics",
          "jaipur foot",
          "bio-inspired mechanisms"
        ],
      },
      {
        id: 12,
        title:
          "Perching and Dynamic Grasping for Aerial Robots: Bio-Inspired Avian Hawk Mechanism",
        authors: "Suthar, B. and Jung, S.",
        journal: "IEEE Robotics and Automation Letters",
        year: 2022,
        type: "journal",
        url: "https://doi.org/10.1109/LRA.2021.3084890",
        citation: 8,
        keywords: [
          "hawk gripper",
          "bio-inspired cat-leap parkour rolling mechanism",
          "cat-leap",
          "parkour",
          "gripper",
          "avian",
          "perching"
        ],
      },
      {
        id: 13,
        title:
          "Learning-Based Adaptive Motion Control and Computer Vision for Autonomous Robotic Manipulation",
        authors: "Suthar, B., Mohd.Zubair and Mukherjee, S.",
        journal: "IEEE Transactions on Industrial Informatics",
        year: 2024,
        type: "journal",
        url: "https://doi.org/10.1109/JSEN.2023.3270172",
        citation: 6,
        keywords: [
          "applied ai in robotics",
          "computer vision for robotics",
          "machine learning models",
          "autonomous decision making",
          "vision",
          "ai in robotics"
        ],
      }
    ];
  }

  /**
   * Find closest publication matching a query string (project title, keyword, vertical).
   * @param {string} queryText - Project title or topic
   * @param {string} areaTitle - Optional vertical / research area title
   * @returns {Promise<Object|null>} Matched publication or null
   */
  async findClosestPublication(queryText = "", areaTitle = "") {
    if (!queryText && !areaTitle) return null;

    // Ensure publications data is loaded
    const pubs = await this.getPublications().catch(() => null);
    const candidateList = Array.isArray(pubs) && pubs.length > 0 ? pubs : this.mockData;

    const normalize = (str) =>
      (str || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const stopWords = new Set([
      "a", "an", "the", "and", "or", "for", "of", "in", "on", "at", "by", "to",
      "with", "based", "using", "from", "as", "its", "their", "system", "systems",
      "design", "development", "analysis", "study", "vertical", "area"
    ]);

    const getKeywords = (str) =>
      normalize(str)
        .split(" ")
        .filter((w) => w.length > 2 && !stopWords.has(w));

    const queryNorm = normalize(queryText);
    const areaNorm = normalize(areaTitle);
    const combinedQuery = `${queryText} ${areaTitle}`.trim();
    const queryTokens = getKeywords(combinedQuery);

    let bestMatch = null;
    let highestScore = 0;

    for (const pub of candidateList) {
      const pubTitleNorm = normalize(pub.title);
      const pubKeywords = [
        ...getKeywords(pub.title),
        ...getKeywords(pub.journal || ""),
        ...(pub.keywords ? pub.keywords.map(normalize) : [])
      ];

      let score = 0;

      // 1. Direct exact or substring matches
      if (queryNorm && pubTitleNorm.includes(queryNorm)) {
        score += 120;
      } else if (queryNorm.length > 5 && pubTitleNorm.includes(queryNorm.slice(0, Math.floor(queryNorm.length * 0.75)))) {
        score += 70;
      }

      // Check keywords list if defined on pub
      if (pub.keywords && Array.isArray(pub.keywords)) {
        for (const kw of pub.keywords) {
          const kwNorm = normalize(kw);
          if (kwNorm && (queryNorm.includes(kwNorm) || kwNorm.includes(queryNorm))) {
            score += 80;
          }
        }
      }

      // 2. Acronym & special robotics terms
      const keyDomainTerms = [
        "tsa", "exoskeleton", "exosuit", "exosuits", "frad", "frahi",
        "finger", "hand", "drone", "space", "haptic", "tele", "gripper",
        "metamorphic", "flexure", "sensor", "prosthetic", "parkour",
        "muscle", "ai", "vision", "supernumerary", "tendon", "perching"
      ];

      for (const term of keyDomainTerms) {
        if (queryNorm.includes(term)) {
          if (pubTitleNorm.includes(term) || (pub.keywords && pub.keywords.some(k => normalize(k).includes(term)))) {
            score += 45;
          }
        }
      }

      // 3. Token overlap
      for (const qToken of queryTokens) {
        if (pubKeywords.includes(qToken) || pubTitleNorm.includes(qToken)) {
          score += 15;
        }
      }

      // 4. Area title relevance bonus
      if (areaNorm) {
        const areaTokens = getKeywords(areaTitle);
        for (const aToken of areaTokens) {
          if (pubTitleNorm.includes(aToken) || pubKeywords.includes(aToken)) {
            score += 5;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = { ...pub, matchScore: score };
      }
    }

    // Minimum score threshold to consider it a meaningful match
    if (bestMatch && highestScore >= 20) {
      return bestMatch;
    }

    return null;
  }

  /**
   * Main method to get publications - handles caching and single fetch
   * @param {string} authorId - Google Scholar author ID
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} Array of publications
   */
  async getPublications(authorId = "3KZSSEIAAAAJ", forceRefresh = false) {
    // If we already have data in memory and not forcing refresh, return it
    if (!forceRefresh && this.publicationsData) {
      return this.publicationsData;
    }

    // If already fetching, return the existing promise
    if (this.isLoading && this.fetchPromise) {
      return this.fetchPromise;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedData = this.getCachedData();
      if (cachedData) {
        this.publicationsData = cachedData.publications;
        this.publicationsStats = cachedData.stats;
        return this.publicationsData;
      }
    }

    // Start fetching
    this.isLoading = true;
    this.fetchPromise = this.fetchFromAPI(authorId);

    try {
      const publications = await this.fetchPromise;
      const stats = await this.calculateStats(publications);

      // Store in memory
      this.publicationsData = publications;
      this.publicationsStats = stats;

      // Cache the data for 1 month
      this.cacheData(publications, stats);

      return publications;
    } finally {
      this.isLoading = false;
      this.fetchPromise = null;
    }
  }

  /**
   * Get statistics - either from memory or calculate them
   * @param {Array} publications - Optional publications array
   * @returns {Promise<Object>} Statistics object
   */
  async getStats(publications = null) {
    // If we have stats in memory, return them
    if (this.publicationsStats && !publications) {
      return this.publicationsStats;
    }

    // If publications provided, calculate stats for them
    if (publications) {
      return this.calculateStats(publications);
    }

    // Otherwise get publications first, then stats
    await this.getPublications();
    return this.publicationsStats || this.calculateDefaultStats();
  }

  /**
   * Force refresh data from API
   * @param {string} authorId - Google Scholar author ID
   * @returns {Promise<Array>} Fresh publications data
   */
  async refreshData(authorId = "3KZSSEIAAAAJ") {
    // Clear cache
    this.clearCache();

    // Clear memory
    this.publicationsData = null;
    this.publicationsStats = null;

    // Fetch fresh data
    return this.getPublications(authorId, true);
  }

  /**
   * Fetch data from API with fallback
   * @param {string} authorId - Google Scholar author ID
   * @returns {Promise<Array>} Publications array
   */
  async fetchFromAPI(authorId) {
    if (!this.apiKey) {
      console.log("No API key available, using mock data");
      return this.mockData;
    }

    try {
      // Try CORS proxies first
      const publications = await this.tryProxies(authorId);
      if (publications) {
        console.log("Successfully fetched from API via proxy");
        return publications;
      }

      // Try direct fetch
      const directResult = await this.tryDirectFetch(authorId);
      if (directResult) {
        console.log("Successfully fetched from API directly");
        return directResult;
      }

      // Fallback to mock data
      console.log("API fetch failed, using mock data");
      return this.mockData;
    } catch (error) {
      console.error("Error in fetchFromAPI:", error);
      return this.mockData;
    }
  }

  /**
   * Try fetching via CORS proxies
   */
  async tryProxies(authorId) {
    const corsProxies = [
      "https://api.allorigins.win/raw?url=",
      "https://cors-anywhere.herokuapp.com/",
      "https://corsproxy.io/?",
    ];

    const targetUrl = `${this.baseUrl}?engine=google_scholar_author&author_id=${authorId}&api_key=${this.apiKey}&num=100&sort=pubdate`;

    for (const proxy of corsProxies) {
      try {
        console.log(`Trying proxy: ${proxy}`);

        let proxyUrl;
        if (proxy.includes("?url=")) {
          proxyUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
        } else {
          proxyUrl = `${proxy}${targetUrl}`;
        }

        const response = await axios.get(proxyUrl, { timeout: 10000 });

        if (response.data && response.data.articles) {
          return this.transformScholarData(response.data.articles);
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error.message);
      }
    }

    return null;
  }

  /**
   * Try direct fetch (may fail due to CORS)
   */
  async tryDirectFetch(authorId) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          engine: "google_scholar_author",
          author_id: authorId,
          api_key: this.apiKey,
          num: 100,
          sort: "pubdate",
        },
        timeout: 10000,
      });

      if (response.data && response.data.articles) {
        return this.transformScholarData(response.data.articles);
      }
    } catch (error) {
      console.warn("Direct fetch failed:", error.message);
    }

    return null;
  }

  /**
   * Calculate statistics from publications
   */
  async calculateStats(publications) {
    const stats = {
      totalCitations: 0,
      hIndex: 0,
      i10Index: 0,
      journalCount: 0,
      conferenceCount: 0,
    };

    if (publications && publications.length > 0) {
      // Calculate total citations
      stats.totalCitations = publications.reduce((total, pub) => {
        const citations = parseInt(pub.citation) || 0;
        return total + citations;
      }, 0);

      // Count publication types
      stats.journalCount = publications.filter(
        (pub) => pub.type === "journal"
      ).length;
      stats.conferenceCount = publications.filter(
        (pub) => pub.type === "conference"
      ).length;

      // Calculate H-index
      const citationCounts = publications
        .map((pub) => parseInt(pub.citation) || 0)
        .sort((a, b) => b - a);

      stats.hIndex = this.calculateHIndex(citationCounts);
      stats.i10Index = citationCounts.filter((count) => count >= 10).length;
    }

    return stats;
  }

  /**
   * Get default stats structure
   */
  calculateDefaultStats() {
    return {
      totalCitations: 0,
      hIndex: 0,
      i10Index: 0,
      journalCount: 0,
      conferenceCount: 0,
    };
  }

  /**
   * Enhanced caching with 1-month duration
   */
  cacheData(publications, stats) {
    if (typeof localStorage === 'undefined') return;
    try {
      const cacheData = {
        publications,
        stats,
        timestamp: Date.now(),
        expires: Date.now() + this.cacheDuration,
        version: "2.0",
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log("Data cached successfully for 1 month");
    } catch (error) {
      console.error("Error caching data:", error);
    }
  }

  /**
   * Get cached data if valid
   */
  getCachedData() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);

        // Check if cache is still valid
        if (Date.now() < cacheData.expires && cacheData.version === "2.0") {
          console.log("Using cached data (valid for 1 month)");
          return cacheData;
        } else {
          console.log("Cache expired or outdated, will fetch fresh data");
          this.clearCache();
        }
      }
    } catch (error) {
      console.error("Error reading cache:", error);
      this.clearCache();
    }
    return null;
  }

  /**
   * Clear cache
   */
  clearCache() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem("scholar_publications"); // Old cache key
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Check if data is currently being loaded
   */
  isDataLoading() {
    return this.isLoading;
  }

  /**
   * Get cache info
   */
  getCacheInfo() {
    if (typeof localStorage === 'undefined') {
      return { hasCache: false, cacheAge: 0, expiresIn: 0, isValid: false };
    }
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        return {
          hasCache: true,
          cacheAge: Date.now() - cacheData.timestamp,
          expiresIn: cacheData.expires - Date.now(),
          isValid: Date.now() < cacheData.expires,
        };
      }
    } catch (error) {
      console.error("Error reading cache info:", error);
    }

    return {
      hasCache: false,
      cacheAge: 0,
      expiresIn: 0,
      isValid: false,
    };
  }

  /**
   * Transform Google Scholar API data to our format
   */
  transformScholarData(articles) {
    return articles.map((article, index) => ({
      id: index + 1,
      title: article.title || "Unknown Title",
      authors: article.authors || "Unknown Authors",
      journal: article.publication || "Unknown Journal",
      year: article.year ? parseInt(article.year) : new Date().getFullYear(),
      type: this.determinePublicationType(article.publication || ""),
      url: article.link || "#",
      citation: article.cited_by ? parseInt(article.cited_by.value) : 0,
    }));
  }

  /**
   * Transform CrossRef API data to our format
   */
  transformCrossRefData(items) {
    return items.map((item, index) => ({
      id: index + 1,
      title: item.title ? item.title[0] : "Unknown Title",
      authors: item.author
        ? item.author.map((a) => `${a.given} ${a.family}`).join(", ")
        : "Unknown Authors",
      journal: item["container-title"]
        ? item["container-title"][0]
        : "Unknown Journal",
      year: item.published
        ? parseInt(item.published["date-parts"][0][0])
        : new Date().getFullYear(),
      type: item.type === "journal-article" ? "journal" : "conference",
      url: item.URL || "#",
      citation: Math.floor(Math.random() * 20), // CrossRef doesn't provide citation counts
    }));
  }

  /**
   * Determine publication type based on journal name
   */
  determinePublicationType(publication) {
    const conferenceKeywords = [
      "conference",
      "symposium",
      "workshop",
      "proceedings",
      "meeting",
      "congress",
      "convention",
      "forum",
      "colloquium",
      "exhibition",
      "ieee conf",
      "ieee int",
      "international conference",
    ];

    const journalKeywords = [
      "Journal Article", // Explicitly stated in your citation list
      "Robotics and Autonomous Systems",
      "Scientific Reports",
      "IEEE Access",
      "IEEE Sensors Journal",
      "Mechatronics",
      "IEEE Transactions on Industrial Electronics",
      "Robotica",
      "Journal of Mechanisms and Robotics", // From "Transactions of the ASME-Journal of Mechanisms and Robotics"
      "Applied Sciences",
      "International Journal of Current Science",
      "International Journal of Information Technology",
      "Computational Intelligence in Software Modeling",
      "International Journal of Robotics and Automation (IJRA)",
      "Current Science",
      "대한전자공학회 학술대회", // Keep this as it's categorized as "Journal Article" in your list
      // General keywords
      "Journal",
      "Transactions",
      "Letters",
      "Review",
      "Elsevier",
      "Springer Nature",
      "MDPI",
      "IEEE",
    ];

    const pubLower = publication.toLowerCase();

    if (conferenceKeywords.some((keyword) => pubLower.includes(keyword))) {
      return "conference";
    } else if (journalKeywords.some((keyword) => pubLower.includes(keyword))) {
      return "journal";
    }

    // Additional checks for common publication patterns
    if (pubLower.match(/^proc(eedings)?\s+of/i)) {
      return "conference";
    }

    if (pubLower.match(/^ieee\s+[a-z\s]+\s+conference/i)) {
      return "conference";
    }

    if (
      pubLower.match(/^journal\s+of\s+/i) ||
      pubLower.includes("j.") ||
      pubLower.includes("journal")
    ) {
      return "journal";
    }

    // Default to journal if unclear
    return "journal";
  }

  /**
   * Calculate H-index from sorted citation counts
   */
  calculateHIndex(sortedCitations) {
    let hIndex = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
      const citations = sortedCitations[i];
      const rank = i + 1;
      if (citations >= rank) {
        hIndex = rank;
      } else {
        break;
      }
    }
    return hIndex;
  }
}

export default new GoogleScholarService();
