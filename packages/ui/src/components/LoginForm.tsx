import { IconCursorText } from "@tabler/icons-react";
import EmailModal from "./ui/EmailModal";
import { LoginFormType, SignupFormType, UserType } from "@repo/common";
import { Button } from "./ui/button";
import MotionTypewriter from "./ui/Typewriter";

// Dots pattern component
export function DotsPattern() {
  return (
    <div className="absolute w-full h-full opacity-20 text-easy-purple-muted">
      <svg className="w-full h-full">
        <defs>
          <pattern
            id="dot-pattern"
            x={0}
            y={0}
            width={25}
            height={25}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={10} cy={10} r={1.5} fill="currentColor" />
          </pattern>
        </defs>
        <rect className="w-full h-full" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
}

// Top section with USERS badge
export function TopSection() {
  return (
    <div className="absolute left-1/3 top-1/12 hidden lg:block">
      <div className="relative w-60 h-20 flex justify-center items-center">
        {/* USERS badge */}
        <div className="flex h-10 w-32 items-center justify-center rounded-[30px] bg-easy-light-blue shadow-primary">
          <span className="font-grandstander text-xl font-extrabold uppercase text-easy-bg">
            USERS
          </span>
        </div>
        <svg
          className="absolute left-0 top-1/3 -translate-full"
          width="56"
          height="19"
          viewBox="0 0 56 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.00018 7.78987C2.98848 6.75914 5.34918 5.13879 7.23662 3.80439C9.20798 2.41066 11.6311 2.1774 18.2632 2.13639C21.3237 2.11747 22.2752 3.57386 23.347 4.46162C24.7046 5.58623 25.6002 7.93173 25.7531 10.5495C25.8905 12.9016 24.2768 13.7725 23.7615 14.105C22.5197 14.9061 20.2226 13.0432 18.8107 11.9682C17.7556 11.1649 17.7001 9.35036 17.7345 5.44026C17.7507 3.59583 19.7616 3.06404 20.7979 2.28823C22.007 1.38301 24.115 1.43705 27.2482 1.17771C35.1048 0.527393 36.9004 1.80058 39.5582 2.76148C42.2386 3.73057 43.404 4.9792 44.6996 6.04871C46.1574 7.25214 47.323 8.15339 48.2839 9.18965C49.5331 10.5369 50.0583 12.0679 51.0181 14.0995C51.2419 14.5838 51.3882 14.9495 51.5367 15.2842C51.6853 15.6189 51.8316 15.9115 51.9823 16.213"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M46.6604 16.5342C47.0827 16.5109 47.5996 16.3704 48.2934 16.2521C49.0599 16.1578 50.1361 16.1105 51.4064 16.1222C51.8845 16.1338 52.0243 16.1571 52.239 16.1811"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M54.075 11.4499C53.7219 12.9512 53.6287 14.2251 53.5691 15.0128C53.5005 15.9178 53.4402 16.8153 53.276 17.0388C52.9735 17.4506 52.2178 17.1232 51.7581 17.0172C51.369 16.8407 51.0633 16.7228 50.3857 16.6875C49.8247 16.6755 48.8227 16.6755 47.649 16.7461"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M53.0157 15.475C53.0157 15.4284 53.0157 14.9383 53.0507 14.1856C53.0857 13.8989 53.1556 13.8057 53.2149 13.6877C53.2742 13.5698 53.3208 13.43 53.5101 13.1447"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Arrow connecting USERS to circle */}
        <div
          className="h-px w-18 bg-white flex items-center justify-between before:content-[''] before:block before:bg-white before:rounded-full before:w-2 before:h-2 before:top-1 before:left-1
        "
        ></div>
        <svg
          className="w-4 h-4 -m-1"
          viewBox="-1.5 -1.5 18.00 18.00"
          version="1.1"
          id="triangle"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#000000"
          fill="white"
          strokeWidth="0.00015000000000000001"
          transform="rotate(90)"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="#CCCCCC"
            strokeWidth="0.09"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              id="path21090-9"
              d="M7.5385,2C7.2437,2,7.0502,2.1772,6.9231,2.3846l-5.8462,9.5385C1,12,1,12.1538,1,12.3077C1,12.8462,1.3846,13,1.6923,13h11.6154C13.6923,13,14,12.8462,14,12.3077c0-0.1538,0-0.2308-0.0769-0.3846L8.1538,2.3846C8.028,2.1765,7.7882,2,7.5385,2z"
            ></path>
          </g>
        </svg>
        {/* Decorative circle with stroke */}
        <div className="relative h-20 w-20 aspect-square rounded-full border-[3px] border-easy-lime opacity-85 box-shadow-black">
          <svg
            className="absolute -top-0 -right-6 -translate-y-1/2"
            width="25"
            height="40"
            viewBox="0 0 31 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.00024 16.9416C1.3097 16.0133 1.9333 14.9161 3.10078 13.1274C4.73242 10.2556 5.99836 7.57371 6.77668 5.54821C7.24554 4.45106 7.86444 3.21326 8.97095 1.00022"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M14.1284 25.3812C16.2946 25.0717 19.1125 24.7576 22.0007 24.3684C23.1869 24.134 23.8058 23.8245 24.8983 23.6651C25.9907 23.5057 27.538 23.5057 29.1321 23.5057"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M18.3482 44.6046C18.8124 44.4499 19.2766 44.2952 20.6761 44.5249C22.0757 44.7547 24.3966 45.3736 25.7469 46.0018C27.0972 46.6301 27.4067 47.249 29.601 48.3555"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Main content with EASY Diagram box and email modal
export function MainContent({
  signupService,
  loginService,
  navigate,
  handleProviderClick,
}: {
  signupService: (signupData: SignupFormType) => Promise<UserType>;
  loginService: (loginData: LoginFormType) => Promise<UserType>;
  navigate: (route: string) => void;
  handleProviderClick: (provider: "google" | "github") => void;
}) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {/* Email Login Modal */}
      <div className="block w-full p-4 lg:p-0 lg:w-auto lg:absolute lg:left-1/4 lg:top-3/5 lg:-translate-1/2">
        <EmailModal
          signupService={signupService}
          loginService={loginService}
          navigate={navigate}
          handleProviderClick={handleProviderClick}
        />
      </div>

      {/* Center content area */}
      <div className="lg:flex flex-col items-center justify-center mt-36 hidden ml-auto mb-auto lg:mr-36 absolute top-1/3 left-7/10 -translate-1/2">
        {/* EASY heading */}

        {/* Diagram box */}
        <div className="flex flex-col ml-auto">
          <div className="relative flex items-center justify-center gap-4 mb-8 lg:mb-0 ">
            <svg
              className="absolute -top-3 -left-3 -translate-1/2"
              width="86"
              height="44"
              viewBox="0 0 96 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M49.4538 52.4186C48.4944 51.726 47.535 51.0334 45.9215 50.3304C44.308 49.6273 42.0695 48.9347 34.8402 45.8076C27.6109 42.6805 15.4587 37.1399 1.00018 29.3327"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M67.8662 37.7276C66.2672 32.8796 64.6682 28.0315 63.3648 23.8026C62.0614 19.5737 61.102 16.1108 60.1135 12.543"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M91.1239 35.6289C91.4437 35.6289 91.7635 35.6289 92.248 33.7243C92.7326 31.8197 93.3721 28.0105 93.8615 22.2391C94.3509 16.4676 94.6707 8.84924 95.0002 1.00003"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <div className="mb-8 text-center lg:mb-0 olute lg:right-[350px] lg:top-[130px] xl:right-[480px]">
              <h1 className="font-krona-one text-[50px] -mt-4 leading-none text-[#E7E3F3] text-shadow-generic">
                EASY
              </h1>
            </div>
            <DiagramBox />
          </div>

          <div className="flex items-center gap-2 flex-left mr-36">
            <div className="flex-1"></div>
            {/* Tagline */}
            <div className="mb-8 max-w-[294px] lg:mb-0 text-right">
              <p className="font-handlee text-2xl text-white">
                Creating flowcharts <br />
                collaboratively with AI <br />
                in Real Time.
              </p>
            </div>
            {/* arrow bottom */}
            <div className=" relative h-50 w-4 flex items-center justify-between before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:content-[''] before:block before:bg-white before:rounded-full before:w-2 before:h-2 after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-px after:h-full after:bg-white after:-translate-x-1/2">
              <svg
                className="mt-auto -mb-2 "
                viewBox="-1.5 -1.5 18.00 18.00"
                version="1.1"
                id="triangle"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#000000"
                fill="white"
                strokeWidth="0.00015000000000000001"
                transform="rotate(180)"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="#CCCCCC"
                  strokeWidth="0.09"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    id="path21090-9"
                    d="M7.5385,2C7.2437,2,7.0502,2.1772,6.9231,2.3846l-5.8462,9.5385C1,12,1,12.1538,1,12.3077C1,12.8462,1.3846,13,1.6923,13h11.6154C13.6923,13,14,12.8462,14,12.3077c0-0.1538,0-0.2308-0.0769-0.3846L8.1538,2.3846C8.028,2.1765,7.7882,2,7.5385,2z"
                  ></path>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* START button */}
        <div className="flex items-center relative">
          <Button
            onClick={() => navigate("canvas")}
            className="ml-40 mt-1 h-14 w-36 rounded-[30px] border-black bg-easy-yellow hover:bg-easy-yellow box-shadow-black transition-transform hover:translate-y-[2px] shadow-primary"
          >
            <span className="font-grandstander text-2xl font-extrabold uppercase text-easy-bg">
              START
            </span>
          </Button>
          {/* Arrow connecting start to right */}
          <div
            className="absolute top-1/2 left-full h-px w-screen bg-white flex items-center justify-between before:content-[''] before:block before:bg-white before:rounded-full before:w-2 before:h-2 before:top-1 before:left-1
        "
          ></div>
        </div>
        {/* bottom right pink circle */}
        <div className="absolute -left-10 -bottom-30 h-22 w-22 rounded-full border border-black bg-easy-pink box-shadow-black lg:block shadow-primary">
          <svg
            className="absolute top-0 -left-4"
            width="123"
            height="91"
            viewBox="0 0 123 91"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M104.327 1.54996C104.327 1.24415 104.327 0.938348 104.556 1.01017C107.05 1.79112 108.793 6.32243 111.652 11.3359C112.352 12.8093 112.963 14.3384 113.278 15.5848C113.593 16.8312 113.593 17.7486 113.593 18.6938"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M119.617 5.72009C120.076 6.94333 120.534 8.16657 120.847 9.17898C121.16 10.1914 121.313 10.9559 121.47 13.597"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M1 64.6299C1.15289 67.2432 2.68656 73.3964 5.00793 77.5921C6.6283 80.5207 9.94259 82.5337 12.9567 85.1608C15.336 86.852 17.977 88.4089 20.2891 89.3356C21.378 89.6507 22.2954 89.6507 23.2407 89.6507"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {/* Lime triangle bottom right */}
          <svg
            className="absolute left-28 -bottom-3 hidden lg:block"
            width="49"
            height="48"
            viewBox="0 0 49 48"
            fill="none"
          >
            <path
              d="M23.59 1.74C26.1-1.18 30.83-.28 32.1 3.35l11.32 32.37c1.27 3.63-1.87 7.28-5.65 6.56l-33.69-6.38c-3.78-.72-5.37-5.26-2.86-8.18l22.37-25.98z"
              fill="#CAF065"
              stroke="black"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Diagram box component
export function DiagramBox() {
  return (
    <div className="relative flex items-center justify-center w-80 h-24 ">
      {/* Main box */}
      {/* <div className="font-krona-one pb-3 text-[50px] leading-none text-[#E7E3F3] text-shadow-generic flex items-center justify-center h-full w-full bg-easy-pink shadow-primary">
        Diagram
      </div> */}
      <MotionTypewriter
        words={["Design", "create", "collab"]}
        speed={0.06} // Optional: Adjust typing speed
        pauseDuration={1500} // Optional: Time to read before backspacing
      />
      <svg className="w-2 h-screen absolute bottom-1/2 left-1/2  -z-10 text-easy-blue">
        <line
          y1={0}
          x1={1}
          y2={"100%"}
          x2={1}
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray={"8,4"}
        />
      </svg>
      <svg className="w-screen h-2 absolute top-1/2 left-1/2  -z-10 text-easy-blue">
        <line
          x1={0}
          y1={1}
          x2={"100%"}
          y2={1}
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray={"8,4"}
        />
      </svg>
      {/* Overlay border */}
      <div className="absolute -left-1 -top-1 -bottom-1 -right-1 outline-1 outline-easy-blue " />
      {/* Corner squares */}
      <div className="absolute -left-2 -top-2 h-2 w-2 border border-easy-blue bg-gray-300 rounded-[3px]" />
      <div className="absolute -bottom-2 -left-2 h-2 w-2 border border-easy-blue bg-gray-300 rounded-[3px]" />
      <div className="absolute -bottom-2 -right-2 h-2 w-2 border border-easy-blue bg-gray-300 rounded-[3px]" />
      <div className="absolute -right-2 -top-2 h-2 w-2 border border-easy-blue bg-gray-300 rounded-[3px] " />
    </div>
  );
}

// Bottom section with SHAPES label
export function BottomSection() {
  return (
    <div className="absolute bottom-1/11 right-1/4 hidden lg:block">
      <div className="relative flex items-center text-white outline-2 outline-easy-blue">
        {/* SHAPES text with stroke */}
        <h3 className="font-krona-one text-2xl uppercase text-white ml-1 text-shadow-primary">
          SHAPES
        </h3>
        <IconCursorText />
      </div>
    </div>
  );
}

// Floating decorative shapes
export function FloatingShapes() {
  return (
    <>
      {/* Large pink circle top left */}
      <div className="absolute -left-12 top-6 hidden h-[120px] w-[120px] rounded-full border border-black bg-easy-pink shadow-primary outline-personal lg:block" />

      {/* Pink circle bottom right */}
    </>
  );
}

// Decorative squiggly lines and arrows
export function DecorativeLines() {
  return (
    <>
      {/* Squiggly line top */}
      <svg
        className="absolute left-[94px] top-[187px] hidden lg:block"
        width="105"
        height="21"
        viewBox="0 0 105 21"
        fill="none"
      >
        <path
          d="M1 17.66c.65-6.51 2.62-11.49 5.59-14.37C7.91 2 8.9 1.23 10.23 2.04c7.6 4.6 7.28 14.78 8.92 17.25.77 1.15 2.3.84 4.28-.38 9.89-6.1 12.56-15.2 15.19-17.47 1.17-1 2.63-.22 3.63 1.82 2.54 5.18 3.31 11.1 5.45 13.77 1.01 1.26 2.47 1.45 3.79.66 7.13-4.34 10.24-11.92 14.02-12.13 11.46-.65 13.06 8.84 15.53 9.05 4.8.41 6.78-7.18 8.59-9.84.92-1.36 2.79-1.45 4.28-1.25 2.8 1.01 4.8 3.48 6.28 6.76.83 1.65 1.81 3.28 3.81 4.96"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Squiggly line bottom */}
      <svg
        className="absolute -left-4 bottom-[94px] hidden lg:block"
        width="111"
        height="20"
        viewBox="0 0 111 20"
        fill="none"
      >
        <path
          d="M-16 6.31C.74 4.57 15.02 1.83 19.21 1.08c6.74-1.2 5.33 10.93 7.14 14.55 1.03 2.04 6.21.88 9.3 0 10.43-2.92 20.27-8.83 25.57-10.96 7.36-2.94 3.86 10.32 6.2 11.57 12.43 6.61 21.75-6.96 25.02-7.09 5.44 2.58 9.52 5.84 11.7 7.95 1.46.88 3.63 1.37 5.86 1.88"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Decorative curve top right */}
      <svg
        className="absolute right-[100px] top-[70px] hidden lg:block"
        width="53"
        height="18"
        viewBox="0 0 53 18"
        fill="none"
      >
        <path
          d="M1 7.79c1.99-1.03 4.35-2.65 6.24-3.99 1.97-1.39 4.39-1.63 11.03-1.67 3.06-.02 4.01 1.44 5.08 2.32 1.36 1.13 2.26 3.47 2.41 6.09.14 2.35-1.48 3.22-2 3.56-1.24.8-3.54-1.06-4.95-2.14-1.06-.8-1.11-2.62-1.08-6.53.02-1.84 2.03-2.38 3.06-3.15 1.21-.91 3.32-.86 6.45-1.11 7.86-.65 9.65.63 12.31 1.59 2.68.97 3.85 2.22 5.14 3.29 1.46 1.2 2.62 2.1 3.58 3.14 1.25 1.35 1.78 2.88 2.74 4.91.22.48.37.85.52 1.18.15.34.29.63.44.93"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}
