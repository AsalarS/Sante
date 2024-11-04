import { useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";

export default function DashBreadcrumb() {
    let currentLink = '';
    const location = useLocation();
    console.log('Current path:', location.pathname);
    const crumbs = location.pathname.split('/')
        .filter((crumb, index) => crumb !== '' && index > 0)
        .map((crumb, index) => {
            currentLink += `/${crumb}`;

            return (
                <React.Fragment key={index}>
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={currentLink}>
                            {crumb.charAt(0).toUpperCase() + crumb.slice(1)}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < location.pathname.split('/').filter(c => c !== '').length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                    )}
                </React.Fragment>
            );
        });

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

