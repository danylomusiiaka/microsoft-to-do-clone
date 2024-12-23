import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import confetti from "canvas-confetti";

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
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
  );
}

export default function NewUserQuest() {
  const { userQuest, setUserQuest } = useUserDetails();
  const [isCompleted, setIsCompleted] = useState<number | null>(null);

  useEffect(() => {
    const cookieUserQuest = Cookies.get("userQuest");
    const { completed } = JSON.parse(cookieUserQuest || "{}");
    if (completed) {
      setIsCompleted(null);
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
      setIsCompleted(0);
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
      setIsCompleted(0);
    }
  }, []);

  useEffect(() => {
    const cookieUserQuest = Cookies.get("newUserQuest");
    if (cookieUserQuest) {
      if (userQuest.every((value) => value === 100)) {
        Cookies.remove("newUserQuest");
        Cookies.set("userQuest", JSON.stringify({ completed: true }));
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { x: Math.random(), y: Math.random() },
            });
          }, i * 200);
        }
        setIsCompleted(1);
      }
    }
  }, [userQuest]);

  return (
    <>
      {isCompleted == 0 && (
        <div
          className='w-fit p-3 rounded-md md:flex'
          style={{ backgroundColor: "var(--secondary-background-color)" }}
        >
          <img src='/educational-cherry.gif' alt='hi-cherry' className='w-52 h-fit' />
          <div className='space-y-3'>
            <p
              className='h-fit rounded-md p-3 text-lg'
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
            >
              Привіт! Я бачу ти новенький <br />
              Виконай пару квестів, щоб краще ознайомитись з додатком
            </p>
            <div className='ml-3'>
              <p>Створи список і заверши 3 завдання</p>
              <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={userQuest[0]} />
              </Box>
            </div>
            <div className='ml-3'>
              <p>Створи команду та запроси туди одного учасника</p>
              <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={userQuest[1]} />
              </Box>
            </div>
            <div className='ml-3'>
              <p>Зміни аватарку та признач комусь завдання в команді</p>
              <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={userQuest[2]} />
              </Box>
            </div>
          </div>
        </div>
      )}

      {isCompleted == 1 && (
        <div
          className='w-fit p-3 rounded-md md:flex'
          style={{ backgroundColor: "var(--secondary-background-color)" }}
        >
          <img src='/congradulations.gif' alt='clapping-cherry' className='w-52 h-fit' />
          <div className='space-y-3'>
            <p
              className='h-fit rounded-md p-3 text-lg'
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
            >
              Ура! Ти пройшов усі завдання! <br />
              Тепер ти повноцінно навчився користуватись додатком
            </p>
            <div className='ml-3'>
              <p>Створи список і заверши 3 завдання</p>
              <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={userQuest[0]} />
              </Box>
            </div>
            <div className='ml-3'>
              <p>Створи команду та запроси туди одного учасника</p>
              <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={userQuest[1]} />
              </Box>
            </div>
            <div className='ml-3'>
              <p>Зміни аватарку та признач комусь завдання в команді</p>
              <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={userQuest[2]} />
              </Box>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
