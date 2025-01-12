import { useContext, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { buttonVariants, Button } from "../ui/button";
import { Menu, MoonIcon, SunIcon } from "lucide-react";
import { LogoIcon } from "../icons";
import { Link, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "@/constants";
import { DarkModeContext } from "../darkMode";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "hero",
    label: "Home",
  },
  {
    href: "features",
    label: "Features",
  },
  {
    href: "team",
    label: "Staff",
  },
  {
    href: "testimonials",
    label: "Reviews",
  },
  {
    href: "footer",
    label: "Contact",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  const navigate = useNavigate();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex items-center">
            <a
              onClick={(e) => handleScroll(e, 'hero')}
              href="#hero"
              className="ml-2 font-extrabold text-3xl flex items-center text-primary font-logo"
            >
              <LogoIcon />
              <span className="ml-2">Santé</span>
            </a>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5 text-foreground"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-3xl text-primary font-logo">
                    Santé
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      key={label}
                      href={`#${href}`}
                      onClick={(e) => {
                        handleScroll(e, href);
                        setIsOpen(false);
                      }}
                      className={`${buttonVariants({ variant: "ghost" })} text-foreground`}
                    >
                      {label}
                    </a>
                  ))}
                  <Button>Login</Button>
                  <Button
                    onClick={toggleDarkMode}
                    className="p-3 rounded-md transition-colors"
                    aria-label="Toggle Dark Mode"
                  >
                    {isDarkMode ? (
                      <SunIcon className="w-12 h-6 text-white" />
                    ) : (
                      <MoonIcon className="w-12 h-6 text-white" />
                    )}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route: RouteProps) => (
              <a
                key={route.label}
                href={`#${route.href}`}
                onClick={(e) => handleScroll(e, route.href)}
                className={`${buttonVariants({ variant: "ghost" })} text-foreground`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-2">
            <Button asChild className="w-20">
              {localStorage.getItem(ACCESS_TOKEN) ? <Link to="/logout">Logout</Link> : <Link to="/login">Login</Link>}
            </Button>
            <Button
              onClick={toggleDarkMode}
              className="p-3 rounded-md transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <SunIcon className="w-12 h-6 text-white" />
              ) : (
                <MoonIcon className="w-12 h-6 text-white" />
              )}
            </Button>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};