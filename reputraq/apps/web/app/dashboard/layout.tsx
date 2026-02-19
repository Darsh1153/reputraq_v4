"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  Newspaper,
  Building2,
  Bot,
  Search,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  Monitor,
  Hash,
  LogOut,
} from "lucide-react";
import FixedRefreshButton from "../../components/FixedRefreshButton";
import styles from "./layout.module.scss";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems: Array<{
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: string;
}> = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    {
      id: "news",
      label: "Media Monitoring",
      icon: Newspaper,
      path: "/dashboard/news",
    },
    {
      id: "competitor",
      label: "Competitor Analysis",
      icon: Building2,
      path: "/dashboard/competitor",
    },
    {
      id: "competitor-vs-news",
      label: "Competitor VS news blog",
      icon: BarChart3,
      path: "/dashboard/competitor-vs-news",
    },
    {
      id: "keywords",
      label: "Keywords Management",
      icon: Search,
      path: "/dashboard/keywords",
    },
    {
      id: "social-listening-finder",
      label: "Social Listening Finder",
      icon: Monitor,
      path: "/dashboard/social-listening-finder",
    },
    {
      id: "hashtag-finder",
      label: "Hashtag Finder",
      icon: Hash,
      path: "/dashboard/hashtag-finder",
    },
    {
      id: "trending-mentions",
      label: "Trending Mentions Finder",
      icon: TrendingUp,
      path: "/dashboard/trending-mentions",
    },
    {
      id: "ai-orm-chatbot",
      label: "AI ORM Chatbot",
      icon: Bot,
      path: "/dashboard/ai-orm-chatbot",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      path: "/dashboard/profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  const filteredNavItems = searchQuery.trim()
    ? navigationItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navigationItems;

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
      {/* Sidebar - Image 1 style: floating panel, rounded, search, theme toggle */}
      <div
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <Image
                src="/social-listening-logo.jpeg"
                alt="Reputraq"
                width={36}
                height={36}
                priority={true}
                className={styles.logoImage}
              />
            </div>
            {sidebarOpen && (
              <div className={styles.brandText}>
                <span className={styles.brandName}>Reputraq</span>
                <span className={styles.brandSubtitle}>Media intelligence</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}

        {!sidebarOpen && <div className={styles.searchIconOnly}><Search size={18} /></div>}

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {filteredNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activePath === item.path;
              return (
                <li key={item.id} className={styles.menuItem}>
                  <button
                    type="button"
                    onClick={() => handleMenuClick(item.path)}
                    className={`${styles.menuButton} ${isActive ? styles.active : ""}`}
                  >
                    <span className={styles.menuIcon}>
                      <IconComponent size={18} />
                    </span>
                    {sidebarOpen && (
                      <>
                        <span className={styles.menuLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={styles.menuBadge}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleSignOut}
            className={styles.footerButton}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className={styles.footerLabel}>Logout</span>}
          </button>
          <div className={styles.themeRow}>
            <span className={styles.themeLabel}>
              {sidebarOpen && (darkMode ? "Light Mode" : "Dark Mode")}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              className={`${styles.themeToggle} ${darkMode ? styles.themeToggleOn : ""}`}
            >
              <span className={styles.themeThumb} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>{children}</div>

      <FixedRefreshButton />
    </div>
  );
}
