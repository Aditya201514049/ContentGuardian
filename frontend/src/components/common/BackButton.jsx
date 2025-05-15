import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to the previous page in history
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-blue-600 dark:text-white rounded hover:text-blue-600 dark:hover:bg-blue-700"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-1" 
        fill="none"
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      {label}
    </button>
  );
};

export default BackButton; 