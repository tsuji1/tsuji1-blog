import Image from "next/image";
export default function Home() {
  return (
    <div> 
    
      <Image
      src="https://github.com/tsuji1.png"
      alt="tsuji1's GitHub profile picture"
      width={500}
      height={500}
      className="rounded-full"
      />
      <div className="flex space-x-4 mt-4">
        <a href="https://github.com/tsuji1" target="_blank" rel="noopener noreferrer" className="block">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12" />
            </svg>
          </div>
        </a>
        <a href="https://x.com/t2uj1" target="_blank" rel="noopener noreferrer" className="block">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
}
