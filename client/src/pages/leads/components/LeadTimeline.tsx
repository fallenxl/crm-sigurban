import {
  Card,
  Timeline,
  TimelineBody,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
} from "@material-tailwind/react";
import { getDays } from "../../../utils";
import { ClockIcon } from "@heroicons/react/24/outline";

interface Props {
  lead: any;
}
export const LeadTimeline = ({ lead }: Props) => {
  return (
    <Card className=" w-full mx-auto p-8">
      <div className="flex items-center p-2 border-b mb-8 gap-2">
        <ClockIcon className="w-5 h-5" />
        <h4 className="font-bold  text-gray-700 ">Linea de Tiempo</h4>
      </div>
      <Timeline className="max-h-[43.2em] overflow-auto px-4">
        {lead.timeline
          .sort((a: any, b: any) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          })
          .map((item: any, index: number) => {
            return (
              <TimelineItem key={item._id}>
                {lead.timeline.length - 1 !== index && <TimelineConnector/>}
                <TimelineHeader className="">
                  <TimelineIcon />
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-bold text-base  text-gray-700">
                      {item.title}
                    </h3>
                    <span className="text-xs text-gray-600">
                      {getDays(item.date)}
                    </span>
                  </div>
                </TimelineHeader>
                <TimelineBody className="pb-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs">{item.message}</span>
                    <small className="text-[.6rem] text-gray-600">
                      Modificado por: {item.updatedBy}
                    </small>
                  </div>
                </TimelineBody>
              </TimelineItem>
            );
          })}
      </Timeline>
    </Card>
  );
};
