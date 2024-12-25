import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import confetti from "canvas-confetti";
import { useProfileFunctions } from "@/components/functions/userFunctions";

function LinearProgressWithTask(props: LinearProgressProps & { value: number; task: string }) {
  return (
    <div className='ml-3'>
      <p>{props.task}</p>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box sx={{ width: "80%", mr: 1 }}>
          <LinearProgress
            variant='determinate'
            {...props}
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: props.value === 100 ? "green" : undefined,
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant='body2' sx={{ color: "var(--primary-text-color)" }}>{`${Math.round(
            props.value
          )}%`}</Typography>
        </Box>
      </Box>
    </div>
  );
}

export default function NewUserQuest({ isUserQuestDone }: { isUserQuestDone: boolean }) {
  const { userQuest, setUserQuest } = useUserDetails();
  const { updateField } = useProfileFunctions();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (isUserQuestDone) {
      return;
    }
    const cookienewUserQuest = Cookies.get("newUserQuest");

    if (!cookienewUserQuest) {
      const initialCookieValue = {
        listCreated: 0,
        completedThreeTasks: 0,
        teamCreated: 0,
        participantJoined: 0,
        profilePictureChanged: 0,
        authorAssignedTask: 0,
      };
      Cookies.set("newUserQuest", JSON.stringify(initialCookieValue));
    } else {
      const {
        listCreated,
        completedThreeTasks,
        teamCreated,
        participantJoined,
        profilePictureChanged,
        authorAssignedTask,
      } = JSON.parse(cookienewUserQuest);

      const values = [
        listCreated + completedThreeTasks,
        teamCreated + participantJoined,
        profilePictureChanged + authorAssignedTask,
      ];
      setUserQuest(values);
    }
    setIsCompleted(false);
  }, []);

  useEffect(() => {
    const cookieUserQuest = Cookies.get("newUserQuest");
    if (cookieUserQuest) {
      if (userQuest.every((value) => value === 100)) {
        Cookies.remove("newUserQuest");
        updateField("isUserQuestDone", true);
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { x: Math.random(), y: Math.random() },
            });
          }, i * 200);
        }
        setIsCompleted(true);
      }
    }
  }, [userQuest]);

  return (
    <>
      {isCompleted !== null && (
        <section
          className='w-fit p-3 rounded-md md:flex'
          style={{ backgroundColor: "var(--secondary-background-color)" }}
        >
          <img
            src={!isCompleted ? "/educational-cherry.gif" : "/congradulations.gif"}
            alt={!isCompleted ? "hi-cherry" : "clapping-cherry"}
            className='w-52 h-52'
          />
          <div className='space-y-3'>
            <div
              className='h-fit rounded-md p-3 text-lg'
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
            >
              {!isCompleted ? (
                <p>
                  Привіт! Я бачу ти новенький. <br /> Виконай пару квестів, щоб краще ознайомитись з
                  додатком
                </p>
              ) : (
                <p>
                  Ура! Ти пройшов усі завдання! <br /> Тепер ти повноцінно навчився користуватись
                  додатком
                </p>
              )}
            </div>
            <LinearProgressWithTask
              value={userQuest[0]}
              task={"Створи список і заверши 3 завдання"}
            />
            <LinearProgressWithTask
              value={userQuest[1]}
              task={"Створи команду та запроси туди одного учасника"}
            />
            <LinearProgressWithTask
              value={userQuest[2]}
              task={"Зміни аватарку та признач комусь завдання в команді"}
            />
          </div>
        </section>
      )}
    </>
  );
}
