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
import { ShimmerButton } from "@/components/magicui/shimmer-button"
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
  LayoutDashboard,
  Menu,
  Phone,
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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { set } from "zod";
import { Badge } from "./ui/badge";




function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}


export default function Nav({className}: { className?: string }) {
  const { status } = useSession();
  return (
    <nav className={cn("sticky top-0 z-40 backdrop-blur-xs px-4 lg:px-10 xl:px-24 py-2 w-full", className)}>
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
            "block select-none space-y-1 rounded-md p-3 no-underline hover:no-underline outline-none transition-colors hover:bg-indigo-50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium">{title}</div>
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

  const [openSubMenu, setOpenSubMenu] = useState<null | "services" | "support" | "quick-services">(
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
        className="lg:min-w-96 overflow-x-hidden max-h-[80vh]"
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
          <Link href="/dashboard" className="w-full">
            <DropdownMenuItem>
              <LayoutDashboard />
              <span>Dashboard</span>
              <DropdownMenuShortcut>
                <ArrowUpRight />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
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
          <QuickServiceLinks
            open={openSubMenu === "quick-services"}
            setOpen={(v: boolean) => setOpenSubMenu(v ? "quick-services" : null)}
          />
          
          <DropdownMenuItem>
            <Link href="/about">About</Link>
            <DropdownMenuShortcut>
              <ArrowUpRight />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/blog">Blog</Link>
            <DropdownMenuShortcut>
              <ArrowUpRight />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/periodic-submission">Periodic Submission</Link>
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
              href="/ra-services"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Research Advisory - RA Services</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/ia-services"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Investment Advisory - IA Services</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
 
        </ul>
      </div>
    </li>
  );
}

export function QuickServiceLinks({
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
        Invest Now
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
              href="/ra-services?type=RESEARCH_ADVISORY"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Research Advisory</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/ia-services?type=MUTUAL_FUNDS"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Mutual Funds Portfolios</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/ra-services?type=SMALLCASE"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Smallcase by Legacis</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/ia-services?type=PORTFOLIO_REVIEW"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Portfolio Review</span>
              <ArrowUpRight size={14} className="opacity-60" />
            </Link>
          </li>
          <li>
            <Link
              href="/platina-wealth"
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/20 "
            >
              <span>Platina Wealth</span>
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
              href="mailto:help@legaciscapital.com"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
                  <Mail size={14} className="opacity-60" /> &nbsp;&nbsp;   
                  <span>help.ia@legaciscapital.com</span>
            </Link>
          </li>
          <li>
            <Link
              href="mailto:help@legaciscapital.com"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
                  <Mail size={14} className="opacity-60" /> &nbsp;&nbsp;   
                  <span>help.ra@legaciscapital.com</span>
            </Link>
          </li>
          <li>
            <Link
              href="tel:+919779774529"
              className="px-4 py-2 flex items-center hover:bg-gray-100/20 "
            >
                  <Phone size={14} className="opacity-60" /> &nbsp;&nbsp;
                  <span>+91 97797 74529</span>
            </Link>
          </li>
        </ul>
      </div>
    </li>
  );
}
// desktop menus

const DesktopNavForNotLoggedIn = () => {
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignIn = () => {
    setMobileOpen(false);
    dispatch(setAuthOpen(true));
    dispatch(setAuthModel("login"));
  };

  return (
    <div className="flex items-center justify-between rounded-lg py-2 backdrop-blur-sm relative">
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

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center justify-center">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About us</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/tools">Tools</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/blog">Blogs</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger  className="px-4 bg-legacisBlue/5 dark:bg-neutral-700 data-[state=open]:text-legacisPurple dark:data-[state=open]:text-[#cd9bff] rounded-full font-normal">
                Start Investing
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-4 relative">
                    <NavigationMenuLink asChild className="relative bg-transparent overflow-hidden">
                      <Link
                        className="flex h-full w-full select-none flex-col pb-16 justify-end rounded-md p-2 no-underline outline-none focus:shadow-md
                        !text-white hover:!text-legacisGreen"
                        href="/ra-services?q=momentum"
                      >
                        <div className="h-full w-full absolute top-0 left-0 z-1 bg-gradient-to-t from-neutral-700/80 to-transparent" />
                       <Image
                          src={'/momentum.jpg'}
                          alt="Momentum Thrust"
                          fill
                          style={{objectFit: 'cover'}}
                          className="opacity-80  h-full w-full rounded-md absolute top-0 left-0"
                       />
                        <h5 className="mb-2 mt-4 text-2xl font-medium z-5 leading-8 backdrop-blur-xs">
                          Momentum Thrust
                        </h5>
                        <Badge className="z-5" variant={'secondary'}>Research Advisory</Badge>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/ra-services?type=RESEARCH_ADVISORY" title="Legacis - Equity Research Advisory" className="">
                    <span className="text-xs">
                      Momentum Thrust, ValueVest, Alpha Micros — and more
                    </span>
                  </ListItem>
                  <ListItem href="/ia-services?type=MUTUAL_FUNDS" title="Legacis - Mutual Fund Portfolios">
                    <span className="text-xs">
                      Curated baskets by risk profile.
                    </span>
                  </ListItem>
                  <ListItem
                    href="/ra-services?type=SMALLCASE"
                    title="Smallcase by Legacis"
                  >

                    <span className="text-xs">
                      Themed portfolios hosted on Smallcase.
                    </span>
                  </ListItem>

                  <Link href={'/ia-services?q=platina'} className="w-full text-neutral-800 ">
                     <div
                     className="!rounded-sm p-4 py-3 bg-transparent w-full shadow-lg shadow-neutral-200 dark:shadow-neutral-800 bg-gradient-to-br from-indigo-50 to-purple-50
                     hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 dark:hover:from-neutral-50 dark:hover:to-neutral-100 transform-3d transition-colors duration-500
                     cursor-pointer shine-effect
                     "
                     >
                        <h6 className="text-sm font-medium text-inherit">Legacis - HNI</h6>
                        <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-800">Platina Wealth</span>
                     </div>
                  </Link>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger  className="px-4 bg-transparent data-[state=open]:text-legacisPurple dark:data-[state=open]:text-[#cd9bff] rounded-full font-normal">
                MITC
              </NavigationMenuTrigger>
              <NavigationMenuContent className="">
                <ul className="grid gap-3 p-1 w-60">
                  <h6 className="text-sm px-4 py-2 bg-purple-50/50 rounded-lg">Most Important Terms & Condition</h6>
                  <ListItem href="/mitc-ia" title="Terms and Conditions - IA" className="!leading-loose py-1 !font-normal" />
                  <ListItem href="/mitc-ra" title="Terms and Conditions - RA" className="!leading-loose py-1 !font-normal"/>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Hamburger */}
      <div className="flex md:hidden items-center gap-2">
         <ModeToggle />
         <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open mobile menu"
              title="Open mobile menu"
              type="button"
            >
              <Menu size={28} />
            </SheetTrigger>
            <SheetContent className="px-2">
               <SheetHeader>
                  <SheetTitle className="text-lg font-bold mb-4">
                  <Link href="/" onClick={() => setMobileOpen(false)}>
                     <Image
                        src="/legacis-logo-black.png"
                        alt="Legacis Logo"
                        width={140}
                        height={40}
                        className="dark:hidden"
                     />
                     <Image
                        src="/legacis-logo-white.png"
                        alt="Legacis Logo"
                        width={120}
                        height={40}
                        className="hidden dark:block"
                     />
                  </Link>
                  </SheetTitle>
               </SheetHeader>
               <div className="flex flex-col gap-2 px-4">
                  <Link href="/" className="py-2" onClick={() => setMobileOpen(false)}>
                     Home
                  </Link>
                  <Link href="/about" className="py-2" onClick={() => setMobileOpen(false)}>
                     About us
                  </Link>
                  <Link href="/tools" className="py-2" onClick={() => setMobileOpen(false)}>
                     Tools
                  </Link>
                  <Link href="/ra-services" className="py-2" onClick={() => setMobileOpen(false)}>
                     Services - RA
                  </Link>
                  <Link href="/ia-services" className="py-2" onClick={() => setMobileOpen(false)}>
                     Services - IA
                  </Link>
                  <Link href="/contact" className="py-2" onClick={() => setMobileOpen(false)}>
                     Contact
                  </Link>
                  <Link href="/blog" className="py-2" onClick={() => setMobileOpen(false)}>
                     Blogs
                  </Link>
                  <Link href="/periodic-submission" className="py-2" onClick={() => setMobileOpen(false)}>
                     Periodic Submission
                  </Link>
               </div>

               <Button
                  className="w-full text-neutral-900 rounded-full bg-legacisLightGreen hover:bg-legacisLightGreen/50 font-normal px-10"
                  onClick={handleSignIn}
               >
                  Sign in
               </Button>
            </SheetContent>
         </Sheet>
      </div>
      <div className="gap-4 md:flex items-center hidden">
         <ModeToggle />
         <Button
            className="text-neutral-900 rounded-full bg-legacisLightGreen hover:bg-legacisLightGreen/50 font-normal px-10"
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
      <Link href="/" className="text-lg font-bold relative h-16 w-36 md:h-20 md:w-44">
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
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/dashboard">
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/tools">Tools</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger  className="px-4 bg-transparent data-[state=open]:text-legacisPurple dark:data-[state=open]:text-[#cd9bff] rounded-full font-normal">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 w-60">
                  <ListItem href="/ia-services" title="Investment Advisory (IA) Services" className="!leading-loose py-1 font-normal" />
                  <ListItem href="/ra-services" title="Research Advisory (RA) Services" className="!leading-loose py-1 font-normal"/>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger  className="px-4 bg-legacisBlue/5 dark:bg-neutral-700 data-[state=open]:text-legacisPurple dark:data-[state=open]:text-[#cd9bff] rounded-full font-normal">
                Start Investing
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-4 relative">
                    <NavigationMenuLink asChild className="relative bg-transparent overflow-hidden">
                      <Link
                        className="flex h-full w-full select-none flex-col pb-16 justify-end rounded-md p-2 no-underline outline-none focus:shadow-md
                        !text-white hover:!text-legacisGreen"
                        href="/ra-services?q=momentum"
                      >
                        <div className="h-full w-full absolute top-0 left-0 z-1 bg-gradient-to-t from-neutral-700/80 to-transparent" />
                       <Image
                          src={'/momentum.jpg'}
                          alt="Momentum Thrust"
                          fill
                          style={{objectFit: 'cover'}}
                          className="opacity-80  h-full w-full rounded-md absolute top-0 left-0"
                       />
                        <h5 className="mb-2 mt-4 text-2xl font-medium z-5 leading-8 backdrop-blur-xs">
                          Momentum Thrust
                        </h5>
                        <Badge className="z-5" variant={'secondary'}>Research Advisory</Badge>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/ra-services?type=RESEARCH_ADVISORY" title="Legacis - Equity Research Advisory" className="">
                    <span className="text-xs">
                      Momentum Thrust, ValueVest, Alpha Micros — and more
                    </span>
                  </ListItem>
                  <ListItem href="/ia-services?type=MUTUAL_FUNDS" title="Legacis - Mutual Fund Portfolios">
                    <span className="text-xs">
                      Curated baskets by risk profile.
                    </span>
                  </ListItem>
                  <ListItem
                    href="/ra-services?type=SMALLCASE"
                    title="Smallcase by Legacis"
                  >

                    <span className="text-xs">
                      Themed portfolios hosted on Smallcase.
                    </span>
                  </ListItem>

                  <Link href={'/platina-wealth'} className="w-full text-neutral-800 ">
                     <div
                     className="!rounded-sm p-4 py-3 bg-transparent w-full shadow-lg shadow-neutral-200 dark:shadow-neutral-800 bg-gradient-to-br from-indigo-50 to-purple-50
                     hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 dark:hover:from-neutral-50 dark:hover:to-neutral-100 transform-3d transition-colors duration-500
                     cursor-pointer shine-effect
                     "
                     >
                        <h6 className="text-sm font-medium text-inherit">Legacis - HNI</h6>
                        <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-800">Platina Wealth</span>
                     </div>
                  </Link>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger  className="px-4 bg-transparent data-[state=open]:text-legacisPurple dark:data-[state=open]:text-[#cd9bff] rounded-full font-normal">
                MITC
              </NavigationMenuTrigger>
              <NavigationMenuContent className="">
                <ul className="grid gap-3 p-1 w-60">
                  <h6 className="text-sm px-4 py-2 bg-purple-50/50 rounded-lg">Most Important Terms & Condition</h6>
                  <ListItem href="/mitc-ia" title="Terms and Conditions - IA" className="!leading-loose py-1 !font-normal" />
                  <ListItem href="/mitc-ra" title="Terms and Conditions - RA" className="!leading-loose py-1 !font-normal"/>
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
