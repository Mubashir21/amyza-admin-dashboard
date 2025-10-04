"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PermissionWrapperProps {
  hasPermission: boolean;
  permissionMessage?: string;
  children: React.ReactNode;
  className?: string;
  disableInteraction?: boolean; // If true, prevents all clicks/interactions
}

export function PermissionWrapper({
  hasPermission,
  permissionMessage = "You don't have permission for this action",
  children,
  className,
  disableInteraction = true,
}: PermissionWrapperProps) {
  const content = (
    <div
      className={cn(
        "relative",
        hasPermission ? "" : "opacity-50",
        className
      )}
    >
      {children}
      {!hasPermission && disableInteraction && (
        <div className="absolute inset-0 cursor-not-allowed z-10" />
      )}
    </div>
  );

  if (!hasPermission && permissionMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{permissionMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
