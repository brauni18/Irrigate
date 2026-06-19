import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>404</h1>
      <p>Page Not Found</p>
      <Link to="/">Go to Home</Link>
    </div>
  );
}
