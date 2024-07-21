import React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GradualSpacingText from "./components/gradualSpacingText";
import { ArrowRight } from "lucide-react";

const Page = () => {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="mb-4 flex w-full items-center justify-center">
        <div
          href="https://github.com/ibelick/background-snippets"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a9a9a9_0%,#0c0c0c_50%,#a9a9a9_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#171717_0%,#737373_50%,#171717_100%)]" />
            <div className="inline-flex h-full w-full cursor-pointer justify-center rounded-full bg-white px-3 py-1 text-xs font-medium leading-5 text-slate-600 backdrop-blur-xl dark:bg-black dark:text-slate-200">
              <span className="inline-flex items-center pl-2 text-black dark:text-white">
                Payroll Protocol{" "}
                <ArrowRight
                  className="pl-0.5 text-black dark:text-white"
                  size={16}
                />
              </span>
            </div>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center">
        <h2 className="text-center text-3xl font-medium max-w-3xl text-gray-900 dark:text-gray-50 sm:text-6xl">
          Advanced Payroll,{" "}
          <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
            Privacy Modules
          </span>
        </h2>
        <p className="max-w-[700px] w-full text-lg  text-center">
          Easily withdraw your funds with Payroll Protocol. Our secure
          blockchain-based system ensures that all transactions are encrypted
          and transparent.
        </p>
        {/* <Badge
          className={
            "bg-secondary hover:bg-muted text-sm flex justify-between gap-3 text-muted-foreground"
          }
        >
          <p>🎉</p>
          <GradualSpacingText
            text={"Payment like never before"}
            className={" tracking-[-0.28em] "}
          />
        </Badge> */}
      </div>

      {/* <div className="flex flex-col items-center gap-4">
        <div className="grid scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl text-center">
          <GradualSpacingText
            text={"Payroll Protocol"}
            className={" tracking-[-0.12em]"}
          />
        </div>
        <p className="max-w-[700px] w-full text-lg  text-center">
          Easily withdraw your funds with Payroll Protocol. Our secure
          blockchain-based system ensures that all transactions are encrypted
          and transparent.
        </p>
      </div> */}

      <div className="flex justify-center mt-3">
        <div className="flex gap-4">
          <a href="https://polygon-payroll.vercel.app/">
            <Button className={"cursor-pointer bg-white text-black"}>
              Polygon
            </Button>
          </a>
          <a href="https://base-payroll.vercel.app/">
            <Button className="cursor-pointer ">Base</Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Page;
