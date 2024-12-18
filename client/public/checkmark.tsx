export default function Checkmark({ status }: { status: string }) {
  return (
    <svg
      width='10'
      viewBox='0 -1.5 12 12'
      id='meteor-icon-kit__regular-checkmark-xs'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1.70711 4.2929C1.31658 3.9024 0.68342 3.9024 0.29289 4.2929C-0.09763 4.6834 -0.09763 5.3166 0.29289 5.7071L3.29289 8.7071C3.68342 9.0976 4.3166 9.0976 4.7071 8.7071L11.7071 1.70711C12.0976 1.31658 12.0976 0.68342 11.7071 0.29289C11.3166 -0.09763 10.6834 -0.09763 10.2929 0.29289L4 6.5858L1.70711 4.2929z'
        className={`checkmark fill-svg ${status === "done" ? "block" : "hidden"} `}
      />
    </svg>
  );
}