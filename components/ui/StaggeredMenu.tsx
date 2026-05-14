"use client";

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import './StaggeredMenu.css';

// Safely get Github icon with fallbacks for different versions of lucide-react
const Github = (LucideIcons as any).Github || (LucideIcons as any).GitHub || (LucideIcons as any).GithubIcon;

export interface StaggeredMenuItem {
  label: string;
  ariaLabel?: string;
  link: string;
  icon?: React.ReactNode;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  currentPath?: string;
  githubUrl?: string;
}

export const StaggeredMenu = ({
  position = 'right',
  colors = ['var(--primary)', 'color-mix(in oklch, var(--primary), transparent 50%)'],
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = false,
  className,
  menuButtonColor = 'var(--foreground)',
  openMenuButtonColor = 'var(--foreground)',
  accentColor = 'var(--primary)',
  changeMenuColorOnOpen = true,
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
  headerLeft,
  headerRight,
  currentPath,
  githubUrl = "https://github.com/FarhanEfendi21/FlowDay.git"
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
    const githubLink = panel.querySelector('.sm-github-link');

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }
    if (githubLink) {
      gsap.set(githubLink, { y: 20, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        );
      }
    }

    const bottomElementsStart = panelInsertTime + panelDuration * 0.4;

    if (socialTitle || socialLinks.length) {
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          },
          bottomElementsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          bottomElementsStart + 0.04
        );
      }
    }

    if (githubLink) {
      tl.to(
        githubLink,
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power4.out'
        },
        bottomElementsStart + 0.15
      );
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        const githubLink = panel.querySelector('.sm-github-link');
        if (githubLink) gsap.set(githubLink, { y: 20, opacity: 0 });
        busyRef.current = false;
      }
    });
  }, [position]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
    }
  }, [playClose, onMenuClose]);

  const toggleMenu = useCallback(() => {
    if (busyRef.current) return;
    const willOpen = !openRef.current;
    if (willOpen) {
      setOpen(true);
      openRef.current = true;
      onMenuOpen?.();
      playOpen();
    } else {
      closeMenu();
    }
  }, [playOpen, closeMenu, onMenuOpen]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  // Close menu when path changes
  useEffect(() => {
    if (open) {
      closeMenu();
    }
  }, [currentPath, closeMenu]);

  return (
    <div
      className={cn("staggered-menu-wrapper", isFixed && "fixed-wrapper", className)}
      style={{
        ...(accentColor ? { '--sm-accent': accentColor } : {}),
        ...(changeMenuColorOnOpen ? {
          '--sm-btn-color': menuButtonColor,
          '--sm-btn-open-color': openMenuButtonColor
        } : {
          '--sm-btn-color': menuButtonColor,
          '--sm-btn-open-color': menuButtonColor
        })
      } as React.CSSProperties}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
          const arr = [...raw];
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2);
            arr.splice(mid, 1);
          }
          return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
        })()}
      </div>
      <header className="staggered-menu-header" aria-label="Main navigation header">
        {headerLeft && <div className="sm-header-left">{headerLeft}</div>}
        
        <div className="flex items-center gap-2 sm-header-right ml-auto">
          {headerRight}
          <button
            ref={toggleBtnRef}
            className="sm-toggle relative z-50 flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span className={`w-6 h-[2px] bg-current rounded-full transition-all duration-300 ease-in-out ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`w-6 h-[2px] bg-current rounded-full transition-all duration-300 ease-in-out ${open ? 'opacity-0 translate-x-2' : ''}`} />
            <span className={`w-6 h-[2px] bg-current rounded-full transition-all duration-300 ease-in-out ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items && items.length ? (
              items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <a 
                    className={cn(
                      "sm-panel-item", 
                      currentPath === it.link && "text-primary"
                    )} 
                    href={it.link} 
                    aria-label={it.ariaLabel} 
                    data-index={idx + 1}
                  >
                    {it.icon && <span className="mr-3 opacity-70">{it.icon}</span>}
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </a>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>
          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="sm-github-section mt-auto pt-4">
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-github-link flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-all duration-300 hover:text-primary group"
            >
              {Github && <Github size={16} className="group-hover:scale-110 transition-transform" />}
              <span>FlowDay Repository</span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
