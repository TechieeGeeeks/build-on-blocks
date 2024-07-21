"use client";

import { Github, Twitter } from "lucide-react";
import MainNav from "./main-nav";
export function SiteHeader() {
  // console.log(user);
  return (
    <header className="backdrop-blur-sm linear-gradient(to bottom right,#accbee,#e7f0fd)top-0 z-40 w-full">
      <div className="container flex h-16 items-center justify-between sm:justify-between sm:space-x-0">
        <div className="">
          <MainNav />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <header className="flex items-center justify-between py-8">
              <div />
              <nav className="flex gap-6">
                <a
                  href="https://x.com/DevSwayam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Twitter
                    className="h-6 w-6 text-neutral-800 transition-colors hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                    strokeWidth={1.5}
                  />
                </a>
                <a
                  href="https://github.com/TechieeGeeeks/build-on-blocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Github
                    className="h-6 w-6 text-neutral-800 transition-colors hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                    strokeWidth={1.5}
                  />
                </a>
              </nav>
            </header>
            {/* <div className="md:flex hidden">
              <NavAlert />
            </div> */}
            {/* <ThemeToggle /> */}
          </nav>
        </div>
      </div>
    </header>
  );
}
