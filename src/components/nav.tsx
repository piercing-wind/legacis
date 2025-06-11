"use client";

import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { SignOut } from "@/actions/session";
import { useAppDispatch } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { setAuthOpen, setAuthModel } from "@/lib/slices/authSlice";
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  User as UserIcon,
  ArrowUpRight,
  FileText,
  RotateCcwSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "next-auth";
import { resetGlobalState } from "@/lib/store";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function Nav() {
  const { status } = useSession();
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xs px-4 lg:px-10 xl:px-24 py-2">
      {status === "authenticated" ? (
        <DesktopNavForLoggedIn />
      ) : (
        <DesktopNavForNotLoggedIn />
      )}
    </nav>
  );
}

const ListItem = React.forwardRef<
  HTMLAnchorElement, // Use React.Ref for the anchor element
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline hover:no-underline outline-none transition-colors hover:bg-legacisLightGreen/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function UserMenu() {
  const dispatch = useAppDispatch();
  const { status, data } = useSession();
  const user: User = data?.user;

  const [openSubMenu, setOpenSubMenu] = useState<null | "services" | "support">(
    null
  );

  const signOut = async () => {
    resetGlobalState(dispatch);
    await SignOut();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.image || "/profile/user-1.png"} />
          <AvatarFallback>User</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="lg:min-w-96 overflow-hidden"
        align="end"
        forceMount
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="w-full p-4 rounded-lg bg-green-100/20 text-neutral-800 dark:text-neutral-50">
          <h6>
            {getGreeting()}! {user?.name?.slice(0, 24)}
          </h6>
        </div>
        <DropdownMenuGroup>
          <Link href="/profile" className="w-full">
            <DropdownMenuItem>
              <UserIcon />
              <span>Profile</span>
              <DropdownMenuShortcut>
                <ArrowUpRight />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href="/profile#transactions" className="w-full">
            <DropdownMenuItem>
              <CreditCard />
              <span>Billings</span>
              <DropdownMenuShortcut>
                <ArrowUpRight />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard?display=subscriptions" className="w-full">
            <DropdownMenuItem>
              <RotateCcwSquare />
              <span>Subscriptions</span>
              <DropdownMenuShortcut>
                <ArrowUpRight />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/">
            <DropdownMenuItem>
              <span>Home</span>
              <DropdownMenuShortcut>
                <ArrowUpRight />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <ServicesSubMenu
            open={openSubMenu === "services"}
            setOpen={(v: boolean) => setOpenSubMenu(v ? "services" : null)}
          />

          <DropdownMenuItem>
            <Link href="/about">About</Link>
            <DropdownMenuShortcut>
              <ArrowUpRight />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/blog">Resources</Link>
            <DropdownMenuShortcut>
              <ArrowUpRight />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SupportSubMenu
          open={openSubMenu === "support"}
          setOpen={(v: boolean) => setOpenSubMenu(v ? "support" : null)}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut />
          <span>Log out</span>
          <DropdownMenuShortcut></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ServicesSubMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <li
      className="relative list-none"
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Button
        className="flex items-center w-full p-2 py-1 text-neutral-900 dark:text-neutral-50 hover:bg-gray-100 rounded justify-between !font-normal"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        variant={"ghost"}
        type="button"
      >
        Services
        <span className="ml-2">
          {open ? (
            <ChevronUp size={14} className="opacity-60" />
          ) : (
            <ChevronDown size={14} className="opacity-60" />
          )}
        </span>
      </Button>
      <div
        className={`transition-all duration-200 overflow-hidden border rounded shadow ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ minWidth: 180 }}
      >
        <ul className="flex flex-col text-sm">
          <li>
            <Link
              href="/services?filter=mutual-funds"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Mutual Funds</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/services?filter=equity-smallcase"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Equity Smallcase</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/services?filter=equity-direct"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Equity Direct Service</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/services?filter=portfolio-review"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Portfolio Review</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
        </ul>
      </div>
    </li>
  );
}
export function SupportSubMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <li
      className="relative list-none"
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Button
        className="flex items-center w-full p-2 py-1 text-neutral-900 dark:text-neutral-50 hover:bg-gray-100 rounded justify-between !font-normal"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        variant={"ghost"}
        type="button"
      >
        <span className="flex items-center">
          <LifeBuoy size={18} className="opacity-50" /> &nbsp;&nbsp;
          <span>Support</span>
        </span>
        <span className="ml-2">
          {open ? (
            <ChevronUp size={14} className="opacity-60" />
          ) : (
            <ChevronDown size={14} className="opacity-60" />
          )}
        </span>
      </Button>
      <div
        className={`transition-all duration-200 overflow-hidden border rounded shadow ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ minWidth: 180 }}
      >
        <ul className="flex flex-col text-sm">
          <li>
            <Link
              href="/contact"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
              <ArrowUpRight size={14} className="opacity-60" /> &nbsp;&nbsp;
              <span>Contact</span>
            </Link>
          </li>
          <li>
            <Link
              href="/ploicies"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
                 <FileText size={14} className="opacity-60" /> &nbsp;&nbsp;
                 <span>Policies</span>
            </Link>
          </li>
          <li>
            <Link
              href="mailto:help@legaciscapital.com"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
                  <Mail size={14} className="opacity-60" /> &nbsp;&nbsp;   
                  <span>help@legaciscapital.com</span>
            </Link>
          </li>
          <li>
            <Link
              href="mailto:help@legaciscapital.com"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
                  <MessageSquare size={14} className="opacity-60" /> &nbsp;&nbsp;
                  <span>+91 88787 87878</span>
            </Link>
          </li>
        </ul>
      </div>
    </li>
  );
}

const DesktopNavForNotLoggedIn = () => {
  const dispatch = useAppDispatch();

  const handleSignIn = () => {
    dispatch(setAuthOpen(true));
    dispatch(setAuthModel("login"));
  };
  return (
    <div className="flex items-center justify-between rounded-lg py-2 backdrop-blur-sm">
      <Link href="/" className="text-lg font-bold relative h-16 w-38">
        <Image
          src="/legacis-logo-black.png"
          alt="Legacis Logo"
          fill
          className="object-contain dark:hidden"
          style={{ objectFit: "contain" }}
        />
        <Image
          src="/legacis-logo-white.png"
          alt="Legacis Logo"
          fill
          className="object-contain hidden dark:block"
          style={{ objectFit: "contain" }}
        />
      </Link>
      <div className="hidden md:flex flex-1 items-center justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/docs">About us</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/docs">Tools</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/docs">Contact</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 border border-legacisBlue rounded-full font-normal">
                Begin Your Investment
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          shadcn/ui
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Beautifully designed components that you can copy and
                          paste into your apps. Accessible. Customizable. Open
                          Source.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/docs" title="Mutual Funds">
                    Invest in a diversified portfolio of stocks, bonds, or other
                  </ListItem>
                  <ListItem href="/docs/installation" title="Installation">
                    How to install dependencies and structure your app.
                  </ListItem>
                  <ListItem
                    href="/docs/primitives/typography"
                    title="Typography"
                  >
                    Styles for headings, paragraphs, lists...etc
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <Button
          className="text-neutral-900 rounded-full bg-legacisLightGreen hover:bg-legacisLightGreen/50 font-normal px-10 "
          onClick={handleSignIn}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};

const DesktopNavForLoggedIn = () => {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2 bg-gradient-to-br from-green-50 to-blue-50 dark:bg-gradient-to-br dark:from-neutral-800 dark:to-neutral-800">
      <Link href="/" className="text-lg font-bold relative h-16 w-38">
        <Image
          src="/legacis-logo-black.png"
          alt="Legacis Logo"
          fill
          className="object-contain dark:hidden"
          style={{ objectFit: "contain" }}
        />
        <Image
          src="/legacis-logo-white.png"
          alt="Legacis Logo"
          fill
          className="object-contain hidden dark:block"
          style={{ objectFit: "contain" }}
        />
      </Link>

      <div className="hidden md:flex flex-1 items-center justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/dashboard">
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/docs">Tools</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 bg-legacisBlue/5 dark:bg-neutral-700 data-[state=open]:text-legacisPurple dark:data-[state=open]:text-[#cd9bff] rounded-full font-normal">
                Start Investing Now
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          shadcn/ui
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Beautifully designed components that you can copy and
                          paste into your apps. Accessible. Customizable. Open
                          Source.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/docs" title="Mutual Funds">
                    Invest in a diversified portfolio of stocks, bonds, or other
                  </ListItem>
                  <ListItem href="/docs/installation" title="Installation">
                    How to install dependencies and structure your app.
                  </ListItem>
                  <ListItem
                    href="/docs/primitives/typography"
                    title="Typography"
                  >
                    Styles for headings, paragraphs, lists...etc
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
};
