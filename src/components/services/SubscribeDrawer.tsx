"use client";
import { use, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Plans from "@/components/services/plans";
import { CheckoutForm } from "./checkoutForm";
import { User } from "next-auth";
import { Agreement, Service, ServicePlan } from "@/prisma/generated/client";
import { ServiceWithComplimentary } from "@/lib/data/services";
import { usePathname, useRouter } from "next/navigation";

export default function SubscribeDrawer({ user, service, servicePlans, agreement, complimentaryServices }: {
    user : User,
    servicePlans : ServicePlan[],
    service : Service,
    agreement : Agreement[],
    complimentaryServices?: ServiceWithComplimentary[]
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (!user) {
      router.push(`/authenticate?callbackurl=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button className="w-full mt-auto p-2 h-10 lg:h-14 uppercase rounded-full" onClick={handleClick}>
        Subscribe Now
      </Button>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl p-4 pb-24 overflow-x-hidden overflow-y-auto flex flex-col lg:flex-row items-stretch justify-between gap-4">
          <div className="rounded-2xl border flex-1 min-w-0 flex flex-col mb-4 lg:mb-0">
            <DrawerHeader>
              <DrawerTitle className="!text-2xl lg:!text-3xl">
                {service.type === 'PORTFOLIO_REVIEW' ? `${service.name}` : 'Subscription Plans'}
              </DrawerTitle>
            </DrawerHeader>
            <Plans plans={servicePlans} service={service} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <CheckoutForm service={service} agreement={agreement} complimentaryServices={complimentaryServices} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}