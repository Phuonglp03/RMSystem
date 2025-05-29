import { MainLogo, HorizontalLogo, MinimalLogo, JesterHat } from '../../components/Logo';

const HomePage = () => {
  

  return (
    <>
    <MainLogo />
    <JesterHat />
    <HorizontalLogo />
    <MinimalLogo />
      <div className="container">
        <h1>Welcome to the RMSystem</h1>
        <p>This is the home page of the RMSystem application.</p>

      </div>
    </>
  );
};
export default HomePage