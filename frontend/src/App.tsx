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

const client = hc<AppType>("http://localhost:8787/");

type ExtractFirstArg<T> = T extends ClientResponse<infer U, any, any>
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
      const meResult = await client.me.$get(
        {},
        {
          init: {
            credentials: "include",
          },
        }
      );
      const userData = await meResult.json();
      console.log("userData", userData);
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
        const result = await client.login.$post(
          {
            json: { email, password },
          },
          {
            init: {
              credentials: "include",
            },
          }
        );
        console.log("result", result);
        if (!result.ok) {
          const error = await result.json();
          invariant("error" in error);
          throw new Error(error.error || "Login failed");
        }
      } else {
        const result = await client.register.$post(
          {
            json: {
              email,
              password,
              name,
            },
          },
          {
            init: {
              credentials: "include",
            },
          }
        );
        if (!result.ok) {
          const error = await result.json();
          invariant("error" in error);
          throw new Error(error.error || "Registration failed");
        }
      }
      navigate("/");
    } catch (err) {
      console.log("error caught", err);
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

  return (
    <div className={styles.container}>
      <div className={styles.welcomeContainer}>
        <h1 className={styles.welcomeTitle}>Welcome, {user.name}!</h1>
        <p className={styles.userEmail}>Email: {user.email}</p>
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
    path: "*",
    element: <Navigate to="/" />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
