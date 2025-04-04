import UserDashboard2050 from "../../components/UserDashboard2050";

export default function UserDashboardPage() {
  return <UserDashboard2050 />;
}

// Use getServerSideProps instead of getStaticProps to render on each request
export async function getServerSideProps() {
  return {
    props: {}
  };
}