"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const MainNav = ({ items, isVisible, isOpen, setIsOpen }) => {
  return (
    <div className="flex md:flex-row flex-col gap-6 md:gap-10">
      <nav className="flex md:flex-row flex-col gap-6">
        <Link
          href={"/"}
          className={cn("flex items-center text-2xl")}
        >
          Payroll Protocol
        </Link>
      </nav>
    </div>
  );
};

export default MainNav;
