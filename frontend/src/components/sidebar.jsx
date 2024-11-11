import { MoreVertical, ChevronLast, ChevronFirst, LogOut } from "lucide-react";
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
    <div role="status">
      <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 text-center" viewBox="0 0 100 101" fill="#6c89fe" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>)
  }

  if (!userInfo) {
    return <div>No user info available</div>;
  }

  return (
    <aside className="h-screen sticky top-0">
      <nav className="h-full inline-flex flex-col bg-background border-r border-border shadow-sm">
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

        <div className="border-t border-border flex p-3">
          <Avatar className="!rounded-md bg-[#C4CFFE] text-lg font-semibold text-[#405298]" onClick={onImageClick}>
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
                <p className="text-foreground">Loading...</p>
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

//TODO: Expanded  context tags are under the avatars in the messages tab  FIX IT!