import Style from './Sidebar.module.css'
import Logo from "../../../public/Flugur_Logo_v2.png"

import { UseAuth } from '../context/authContext';
import { NavLink } from 'react-router'
import { useState } from 'react';
import { LayoutGrid, BookOpen, FileText, Users, Settings, LogOut, ChevronDown, ChevronRight, Wallet, Wrench } from "lucide-react";

// const NAV_ITEMS = [
//   { label: "Dashboard", icon: LayoutGrid, path: "/Dashboard" },
//   { label: "Accounting", icon: BookOpen,
//     children: [
//       { key: "Ledger", label: "Ledger Accounts", path: "/Dashboard/Ledger" },
//       { key: "Journals", label: "Journal Headers", path: "/Dashboard/Journal" },
//     ]
//   },
//   { label: "Invoices", icon: FileText, 
//     children: [
//       { key: "AP Invoices", label: "Accounts Payable ", path: "/Dashboard/AP_Invoices" },
//       { key: "AR Invoices", label: "Accounts Receivable ", path: "/Dashboard/AR_Invoices" },
//     ]
//   },
//   { label: "Clients", icon: Users, 
//     children: [
//       { key: "Vendors", label: "Vendors", path: "/Dashboard/Vendors" },
//       { key: "Customers", label: "Customers", path: "/Dashboard/Customers" },
//     ]
//   },
//     { label: "Payments", icon: Wallet,
//     children: [
//       { key: "AP", label: "AP Payments", path: "/Dashboard/AP_Payment" },
//     ]
//   },
//   { label: "Fixed Assets", icon: Wrench, path: "/Dashboard/Assets" },
//   { label: "Reports", icon: FileText, path: "/Dashboard/reports" },
//   { label: "User Management", icon: Users, active: true, path: "/Dashboard/users" },
//   { label: "Settings", icon: Settings, path: "/Dashboard/settings" }

// ];


const NAV_ITEMS = [
  {
    label: "Dashboard", icon: LayoutGrid, path: "/Dashboard", roles: ["Admin", "Accountant"]
  },
  { label: "Accounting",  icon: BookOpen, roles: ["Accountant"],
    children: [
      { key: "Ledger", label: "Ledger Accounts", path: "/Dashboard/Ledger", roles: ["Accountant"] },
      { key: "Journals", label: "Journal Headers", path: "/Dashboard/Journal", roles: ["Accountant"] },
    ]
  },
  { label: "Invoices", icon: FileText, roles: ["Accountant"],
    children: [
      { key: "AP Invoices", label: "Accounts Payable", path: "/Dashboard/AP_Invoices", roles: ["Accountant"] },
      { key: "AR Invoices", label: "Accounts Receivable", path: "/Dashboard/AR_Invoices", roles: ["Accountant"] },
    ]
  },
  { label: "Clients", icon: Users, roles: ["Accountant"],
    children: [
      { key: "Vendors", label: "Vendors", path: "/Dashboard/Vendors", roles: ["Accountant"] },
      { key: "Customers", label: "Customers", path: "/Dashboard/Customers", roles: ["Accountant"] },
    ]
  },
  { label: "Payments", icon: Wallet,roles: ["admin", "accountant"],
    children: [
      { key: "AP", label: "AP Payments", path: "/Dashboard/AP_Payment", roles: ["Accountant"] },
    ]
  },
  { label: "Fixed Assets", icon: Wrench, path: "/Dashboard/Asset", roles: ["Accountant"]
  },
  { label: "Reports", icon: FileText, path: "/Dashboard/reports", roles: ["Accounting Manager"]
  },
  { label: "User Management", icon: Users, path: "/Dashboard/users", roles: ["Admin"]
  },
  { label: "Settings", icon: Settings, path: "/Dashboard/settings", roles: ["Admin"]
  }
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const { user } = UseAuth();

  const toggleMenu = (label) => { setOpenMenus(prev => ({ ...prev, [label]: !prev[label] })); };


  const filteredNavItems = NAV_ITEMS
    .filter(item => !item.roles || item.roles.includes(user?.role))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(
            child => !child.roles || child.roles.includes(user?.role)
          )
        };
      }
      return item;
    })
    .filter(item => !item.children || item.children.length > 0);

  return (
    <aside className={Style.umsidebar}>
      <div className={Style.umbrand}>
        <div className={Style.umbrandmark}>
          <img src={Logo} />
        </div>
        <div>
          <div className={Style.umbrandname}>Flugur ERP</div>
          <div className={Style.umbrandtag}>PRECISION LEDGER</div>
        </div>
      </div>

      <nav className={Style.umnav}>
        {filteredNavItems.map((item) => {
          const isOpen = openMenus[item.label] || false;

          if (item.children && item.children.length > 0) {
            return (
              <div key={item.label} className={Style.umdropdown}>
                <div className={Style.umdropdownHeader} onClick={() => toggleMenu(item.label)}>
                  <div className={Style.umdropdownTitle}>
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? (<ChevronDown size={16} />) : (<ChevronRight size={16} />)}
                </div>

                {isOpen && (<div className={Style.umdropdownContent}>
                  {item.children.map((child) => (
                    <NavLink
                      key={child.key || child.label}
                      to={child.path}
                      className={({ isActive }) => `${Style.umdropdownItem} ${isActive ? Style.umactive : ""}`}>
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `${Style.umnavitem} ${isActive ? Style.umactive : ""}`}>
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={Style.umsidebarfooter}>
        <div className={Style.umusermini}>
          <div className={Style.umuseravatar} />
          <div>
            <div className={Style.umusername}>David Miller</div>
            <div className={Style.umuserrole}>Super Admin</div>
          </div>
        </div>
        <LogOut size={16} className={Style.umlogout} />
      </div>
    </aside>
  )
}