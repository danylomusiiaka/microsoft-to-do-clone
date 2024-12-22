import ThreeDots from "../../public/three-dots";

export default function StartScreen() {
  return (
    <div className='md:flex justify-center items-center w-full h-full space-x-6'>
      <img src='/no-tasks.gif' alt='no-tasks-cherry' className='w-60 h-60' />
      <div className='space-y-4'>
        <h1 className='text-3xl font-semibold'>Це початок роботи з планування задач</h1>
        <p className='text-lg'>Створіть своє перше завдання і воно відобразиться тут</p>
        <p>Також ознайомтесь</p>
        <ul className='list-disc space-y-2'>
          <li className='flex items-center before:content-["•"] before:mr-2'>
            зі статистикою завдань
            <img className='w-6 ml-3' src='/star.svg' alt='statisctics' />
          </li>
          <li className='flex items-center before:content-["•"] before:mr-2'>
            з сортуванням завдань натиснувши
            <span className='ml-3'>
              <ThreeDots />
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
