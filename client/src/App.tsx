import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  trainerSessions: number;
  subscription: {
    name: string;
    status: string;
    price: string;
    startsAt: string;
    expiresAt: string;
  } | null;
};

type AuthMode = "register" | "login";

const workoutTypes = [
  {
    title: "Strength",
    meta: "45 min",
    level: "Medium",
    color: "coral",
  },
  {
    title: "Cardio Burn",
    meta: "28 min",
    level: "High",
    color: "lime",
  },
  {
    title: "Body & Mind",
    meta: "35 min",
    level: "Calm",
    color: "blue",
  },
  {
    title: "Dance Flow",
    meta: "32 min",
    level: "All levels",
    color: "violet",
  },
];

const benefits = [
  "200+ video workouts in HD",
  "Train on phone, laptop, or TV",
  "Fresh programs every week",
  "14-day free trial for new members",
];

const trainers = [
  {
    name: "Mira Kask",
    role: "Strength coach",
    initials: "MK",
    accent: "mint",
    bio: "Builds clear strength plans with controlled technique and confident progress.",
  },
  {
    name: "Laura Tamm",
    role: "Cardio & dance",
    initials: "LT",
    accent: "coral",
    bio: "Keeps high-energy sessions sharp, musical, and easy to follow at home.",
  },
  {
    name: "Nikolai Sokolov",
    role: "Mobility trainer",
    initials: "NS",
    accent: "blue",
    bio: "Focuses on joint-friendly movement, recovery, posture, and daily flexibility.",
  },
];

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pulsefit_token");

    if (!token) {
      return;
    }

    fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Session expired.");
        }

        return response.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("pulsefit_token"));
  }, []);

  useEffect(() => {
    if (!user) {
      setAvatar("");
      return;
    }

    setAvatar(localStorage.getItem(`pulsefit_avatar_${user.id}`) || "");
  }, [user]);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/${authMode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem("pulsefit_token", data.token);
      setUser(data.user);
      setPassword("");
      setAuthMessage(
        authMode === "register"
          ? "Account created. Your JWT token is saved locally."
          : "Welcome back. Your JWT token is active."
      );
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pulsefit_token");
    setUser(null);
    setAuthMessage("You are logged out.");
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      localStorage.setItem(`pulsefit_avatar_${user.id}`, image);
      setAvatar(image);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    if (!user) {
      return;
    }

    localStorage.removeItem(`pulsefit_avatar_${user.id}`);
    setAvatar("");
  };

  const handleBuySubscription = async () => {
    setPurchaseMessage("");

    if (!user) {
      setPurchaseMessage("Please register or log in before buying a subscription.");
      window.location.hash = "auth";
      return;
    }

    const token = localStorage.getItem("pulsefit_token");
    setIsPurchasing(true);

    try {
      const response = await fetch("/api/subscription/buy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Subscription purchase failed.");
      }

      setUser(data.user);
      setPurchaseMessage("Monthly access is active. You can see it in your profile.");
      window.location.hash = "profile";
    } catch (error) {
      setPurchaseMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));

  const subscriptions = [
    ...(user?.subscription
      ? [
          {
            name: user.subscription.name,
            status: user.subscription.status,
            renews: `Valid until ${formatDate(user.subscription.expiresAt)}`,
            price: user.subscription.price,
          },
        ]
      : []),
    {
      name: "Trainer session",
      status: "Free gift",
      renews: `${user?.trainerSessions ?? 0} booking ${
        user?.trainerSessions === 1 ? "credit" : "credits"
      }`,
      price: "Included",
    },
  ];

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="L&D Fit home">
          <span className="brand-mark">L&D</span>
          L&D Fit
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#workouts">Workouts</a>
          <a href="#trainers">Trainers</a>
          <a href="#pricing">Pricing</a>
          <a href="#profile">Profile</a>
          <a href="#auth">Register</a>
        </nav>
        <a
          className={user ? "header-profile-button" : "ghost-button"}
          href={user ? "#profile" : "#auth"}
        >
          {user ? (
            <>
              <span className="header-avatar" aria-hidden="true">
                {avatar ? (
                  <img src={avatar} alt="" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </span>
              <span>{user.name}</span>
            </>
          ) : (
            "Start trial"
          )}
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">Online training platform</span>
          <h1>Train wherever your day takes you.</h1>
          <p>
            A flexible video workout library for strength, cardio, mobility,
            and recovery. Open a session, press play, and move with real intent.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#auth">
              Join L&D Fit
            </a>
            <a className="text-link" href="#workouts">
              Explore workouts
            </a>
          </div>
          <div className="hero-stats" aria-label="Platform highlights">
            <span>
              <strong>220+</strong>
              workouts
            </span>
            <span>
              <strong>4</strong>
              styles
            </span>
            <span>
              <strong>HD</strong>
              video
            </span>
          </div>
        </div>

        <div className="training-preview" aria-label="Featured workout preview">
          <div className="preview-screen">
            <div className="play-button" aria-hidden="true" />
            <div className="class-chip">Live feel</div>
            <div className="coach-card">
              <span>Today</span>
              <strong>Full Body Power</strong>
              <small>Coach Mira / 45 min</small>
            </div>
          </div>
          <div className="preview-footer">
            <span>Next class</span>
            <strong>Mobility Reset at 18:30</strong>
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div>
          <span className="eyebrow">Why choose it</span>
          <h2>A studio rhythm without the commute.</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit}>
              <span aria-hidden="true">+</span>
              <p>{benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section workouts-section" id="workouts">
        <div className="section-heading">
          <span className="eyebrow">Training styles</span>
          <h2>Pick the energy that fits today.</h2>
        </div>
        <div className="workout-grid">
          {workoutTypes.map((workout) => (
            <article className={`workout-card ${workout.color}`} key={workout.title}>
              <div>
                <span>{workout.level}</span>
                <h3>{workout.title}</h3>
              </div>
              <p>{workout.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section trainers-section" id="trainers">
        <div className="section-heading trainers-heading">
          <div>
            <span className="eyebrow">Our trainers</span>
            <h2>Guided by coaches who keep you moving well.</h2>
          </div>
          <p>
            Choose a trainer by mood, goal, or training style. Every class is
            designed to feel personal, even when you train from home.
          </p>
        </div>
        <div className="trainer-grid">
          {trainers.map((trainer) => (
            <article className="trainer-card" key={trainer.name}>
              <div className={`trainer-avatar ${trainer.accent}`}>
                {trainer.initials}
              </div>
              <div>
                <span>{trainer.role}</span>
                <h3>{trainer.name}</h3>
                <p>{trainer.bio}</p>
              </div>
              <a href="#auth">Book session</a>
            </article>
          ))}
        </div>
      </section>

      <section className="member-band">
        <div>
          <span className="eyebrow">For club members</span>
          <h2>Already training with us?</h2>
          <p>
            Club members get full access with their existing account. Keep your
            routine alive at home, while travelling, or between busy days.
          </p>
        </div>
        <a className="secondary-button" href="#auth">
          Log in
        </a>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="pricing-copy">
          <span className="eyebrow">Start now</span>
          <h2>Unlimited video workouts for one simple monthly price.</h2>
          <p>
            Build strength, stamina, and consistency with guided sessions that
            feel premium without needing a fixed schedule.
          </p>
        </div>
        <article className="price-card">
          <span>Monthly access</span>
          <strong>EUR 9.95</strong>
          <p>14 days free, cancel anytime.</p>
          <button
            className="primary-button"
            type="button"
            onClick={handleBuySubscription}
            disabled={isPurchasing || Boolean(user?.subscription)}
          >
            {user?.subscription
              ? "Package active"
              : isPurchasing
                ? "Activating..."
                : "Activate package"}
          </button>
          {purchaseMessage && <small className="purchase-message">{purchaseMessage}</small>}
        </article>
      </section>

      <section className="auth-section" id="auth">
        <div className="auth-copy">
          <span className="eyebrow">JWT registration</span>
          <h2>Create your training account.</h2>
          <p>
            Register or log in to receive a JWT token from the server. The token
            is saved in localStorage and used for protected requests.
          </p>
        </div>

        <div className="auth-panel">
          {user ? (
            <div className="profile-card">
              <span className="status-pill">Signed in</span>
              <h3>Hello, {user.name}</h3>
              <p>{user.email}</p>
              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <>
              <div className="auth-tabs" aria-label="Authentication mode">
                <button
                  className={authMode === "register" ? "active" : ""}
                  type="button"
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
                <button
                  className={authMode === "login" ? "active" : ""}
                  type="button"
                  onClick={() => setAuthMode("login")}
                >
                  Log in
                </button>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === "register" && (
                  <label>
                    Name
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Dmitri"
                      required
                    />
                  </label>
                )}
                <label>
                  E-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                  />
                </label>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Please wait..."
                    : authMode === "register"
                      ? "Create account"
                      : "Log in"}
                </button>
              </form>
            </>
          )}
          {authMessage && <p className="auth-message">{authMessage}</p>}
        </div>
      </section>

      <section className="profile-section" id="profile">
        <div className="profile-heading">
          <span className="eyebrow">Profile</span>
          <h2>Your training space.</h2>
          <p>
            Manage your avatar, check account information, and see active
            subscriptions connected to your L&D Fit account.
          </p>
        </div>

        {user ? (
          <div className="profile-layout">
            <article className="profile-main">
              <div className="avatar-editor">
                <div className="profile-avatar">
                  {avatar ? (
                    <img src={avatar} alt={`${user.name} avatar`} />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="avatar-actions">
                  <label className="upload-button">
                    Change avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                  {avatar && (
                    <button type="button" onClick={removeAvatar}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="info-list">
                <div>
                  <span>Name</span>
                  <strong>{user.name}</strong>
                </div>
                <div>
                  <span>E-mail</span>
                  <strong>{user.email}</strong>
                </div>
              </div>
            </article>

            <article className="subscriptions-card">
              <div className="subscriptions-title">
                <span className="status-pill">Subscriptions</span>
                <h3>Current access</h3>
              </div>
              <div className="subscription-list">
                {subscriptions.map((subscription) => (
                  <div className="subscription-item" key={subscription.name}>
                    <div>
                      <span>{subscription.status}</span>
                      <strong>{subscription.name}</strong>
                      <small>{subscription.renews}</small>
                    </div>
                    <p>{subscription.price}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        ) : (
          <article className="profile-locked">
            <span className="status-pill">Login required</span>
            <h3>Sign in to open your profile.</h3>
            <p>
              After registration, this tab will show your account details,
              avatar controls, and subscriptions.
            </p>
            <a className="primary-button" href="#auth">
              Register or log in
            </a>
          </article>
        )}
      </section>
    </main>
  );
}

export default App;
