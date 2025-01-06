import ThreeDots from "../../public/three-dots";

export default function NoAssignments() {
  return (
    <div className='md:flex justify-center items-center w-full h-full md:space-x-6'>
      <img src='/no-tasks.gif' alt='no-tasks-cherry' className='w-60 h-60' />
      <div className='space-y-4'>
        <h1 className='text-3xl font-semibold'>Тут відображаються призначені Вам завдання</h1>
        <p className='text-lg'>Схоже тут нічого немає. Тому поки відпочивайте!</p>
        <p>Також ознайомтесь</p>
        <ul className='list-disc space-y-2 text-nowrap'>
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
