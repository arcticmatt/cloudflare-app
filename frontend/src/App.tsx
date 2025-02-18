import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { ClientResponse, hc } from "hono/client";
import type { AppType } from "../../durable-object-starter/src/index";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useNavigate,
} from "react-router";
import invariant from "tiny-invariant";

const client = hc<AppType>(import.meta.env.VITE_SERVER_URL, {
  init: {
    credentials: "include",
  },
});

type ExtractFirstArg<T> = T extends ClientResponse<infer U, number, string>
  ? U
  : never;
type User = Exclude<
  ExtractFirstArg<Awaited<ReturnType<(typeof client)["me"]["$get"]>>>,
  { error: string } | null
>;

function useMe(shouldNavigate: boolean = true) {
  const [user, setUser] = useState<User | null | undefined>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const meResult = await client.me.$get();
      const userData = await meResult.json();
      if (!userData || "error" in userData) {
        setUser(null);
        if (shouldNavigate) {
          navigate("/login");
        }
      } else {
        setUser(userData);
      }
    }
    checkAuth();
  }, [navigate, shouldNavigate]);

  return user;
}

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const user = useMe();
  useEffect(() => {
    if (user != null) {
      navigate("/");
    }
  }, [navigate, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isLogin) {
        const result = await client.login.$post({
          json: { email, password },
        });
        if (!result.ok) {
          const error = await result.json();
          invariant("error" in error);
          throw new Error(error.error || "Login failed");
        }
      } else {
        const result = await client.register.$post({
          json: {
            email,
            password,
            name,
          },
        });
        if (!result.ok) {
          const error = await result.json();
          invariant("error" in error);
          throw new Error(error.error || "Registration failed");
        }
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{isLogin ? "Login" : "Register"}</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
        </div>
        {!isLogin && (
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
        )}
        <button type="submit" className={styles.button}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className={styles.switchButton}
      >
        {isLogin ? "Need to register?" : "Already have an account?"}
      </button>
    </div>
  );
}

function HomePage() {
  const user = useMe();
  if (!user) return null;

  const handleLogout = async () => {
    await client.logout.$post();
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcomeContainer}>
        <h1 className={styles.welcomeTitle}>Welcome, {user.name}!</h1>
        <p className={styles.userEmail}>Email: {user.email}</p>
        <button onClick={handleLogout} className={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/hello",
    element: <div>Hello world!</div>,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
