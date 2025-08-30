import React from "react";
import { useNotification } from "@/context/NotificationContext";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notification: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-success" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-warning" />;
            default:
                return <Info className="h-5 w-5 text-primary" />;
        }
    };

    const getStyles = (type: string) => {
        switch (type) {
            case "success":
                return "border-success bg-success/40 text-black";
            case "error":
                return "border-destructive bg-destructive/40 text-black";
            case "warning":
                return "border-warning bg-warning/40 text-black";
            default:
                return "border-primary bg-primary/40 text-black";
        }
    };

    return (
        <div className="font-vend">
            <div className="fixed top-16 right-4 z-[9999] space-y-2 w-[90%] max-w-sm sm:w-full">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`flex items-start p-4 rounded-lg border shadow-card transition-all duration-300 ${getStyles(
                            notification.type
                        )}`}
                    >
                        {/* Icon */}
                        <div className="flex-shrink-0 mr-3 mt-1">{getIcon(notification.type)}</div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium break-words mt-1">
                                {notification.message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-black/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notification;
