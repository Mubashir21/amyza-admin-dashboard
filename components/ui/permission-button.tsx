"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PermissionButtonProps extends React.ComponentProps<typeof Button> {
  hasPermission: boolean;
  permissionMessage?: string;
  children: React.ReactNode;
}

export function PermissionButton({
  hasPermission,
  permissionMessage = "You don't have permission for this action",
  children,
  className,
  ...props
}: PermissionButtonProps) {
  const button = (
    <Button
      {...props}
      disabled={!hasPermission}
      className={cn(
        hasPermission ? "" : "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={hasPermission ? props.onClick : undefined}
    >
      {children}
    </Button>
  );

  if (!hasPermission) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{permissionMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
