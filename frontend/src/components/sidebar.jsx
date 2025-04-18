import { MoreVertical, ChevronLast, ChevronFirst, LogOut, Loader2 } from "lucide-react";
import { useContext, createContext, useState, useEffect } from "react";
import { LogoAndText } from "./icons";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from '../api'; // Assuming you have an api utility for making requests
import { ACCESS_TOKEN } from '../constants';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SidebarContext = createContext();

export default function Sidebar({ children, onImageClick }) {
  const [expanded, setExpanded] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const userInfoObject = JSON.parse(userInfo);
          setUserInfo(userInfoObject);

        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return(
      <div className="flex justify-center items-center h-lvh w-lvh">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>

    )
  }

  if (!userInfo) {
    return <div className="text-foreground">No user info available</div>;
  }

  return (
    <aside className="h-screen sticky top-0">
      <nav className="h-full inline-flex flex-col bg-background border-r border-border/50 shadow-xs">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div
            className={`transition-all overflow-hidden ${expanded ? "max-w-xs" : "max-w-0"
              }`}
          >
            <Link to={'/'}>
              <LogoAndText className="w-32 cursor-pointer" />

            </Link>
          </div>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-darker-background hover:bg-even-darker-background "
          >
            {expanded ? <ChevronFirst className="text-foreground" /> : <ChevronLast className="text-foreground" />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t border-border/50 flex p-3">
          <Avatar className="rounded-md! bg-[#C4CFFE] text-lg font-semibold text-[#405298]" onClick={onImageClick}>
            <AvatarImage src={userInfo.profile_image} />
            <AvatarFallback>{userInfo.first_name.charAt(0).toUpperCase()}{userInfo.last_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
          >
            <div className="leading-4">
              {userInfo ? (
                <>
                  <h4 className="font-semibold text-foreground line-clamp-1 break-all">{userInfo.first_name} {userInfo.last_name}</h4>
                  <span className="text-xs text-muted-foreground line-clamp-1 break-all">{userInfo.email}</span>
                </>
              ) : (
                <Loader2 className="animate-spin w-6 h-6 text-primary" />
              )}
            </div>
            <div className="p-1.5 rounded-lg bg-darker-background hover:bg-even-darker-background text-foreground">
              <LogOut size={23} onClick={handleLogout} />
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert, onClick }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active
          ? "bg-dash-active font-bold"
          : "hover:bg-dash-hover text-gray-600"
        }
    `}
      onClick={onClick}
    >
      <span className={`text-primary ${active ? "text-white" : "text-gray-600"}`}>
        {icon}
      </span>
      <span
        className={`overflow-hidden transition-all text-primary ${expanded ? "w-52 ml-3" : "w-0"
          } ${active ? "text-white" : "text-gray-600"}`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={` group-hover:animate-pulse absolute right-2 w-2 h-2 rounded bg-[#6B88FE] ${expanded ? "" : "top-2"
            }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-dash-hover text-[#6B88FE] text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          !z-50
      `}
        >
          {text}
        </div>
      )}
    </li>
  );
}

// source https://www.youtube.com/watch?v=NFrFhBJPTmI