export default function Plus({ name = "plus" }) {
  return (
    <svg width='25px' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M4 12H20M12 4V20'
        stroke='#fff'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={name}
      />
    </svg>
  );
}
