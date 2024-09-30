import Loader from "@components/Shared/Loader";
import { getAuthApiHeaders } from "@helpers/getAuthApiHeaders";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { HEY_API_URL, IS_MAINNET } from "@hey/data/constants";
import formatDate from "@hey/helpers/datetime/formatDate";
import { Card, CardHeader, EmptyState, ErrorMessage } from "@hey/ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import type { FC } from "react";
import { Bar } from "react-chartjs-2";
import colors from "tailwindcss/colors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SignupRevenue: FC = () => {
  const getSignupRevenueStats = async (): Promise<
    { date: string; count: number }[] | null
  > => {
    try {
      const response = await axios.get(
        `${HEY_API_URL}/lens/internal/stats/signup-revenue`,
        { headers: getAuthApiHeaders() }
      );

      return response.data?.result || null;
    } catch {
      return null;
    }
  };

  const { data, error, isLoading } = useQuery({
    enabled: IS_MAINNET,
    queryFn: getSignupRevenueStats,
    queryKey: ["getSignupRevenueStats"],
    refetchInterval: 5000
  });

  if (isLoading) {
    return (
      <Card>
        <Loader className="my-10" message="Loading signup revenue stats..." />
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorMessage error={error} title="Failed to load signup revenue stats" />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={<ChartBarIcon className="size-8" />}
        message="No data available"
      />
    );
  }

  return (
    <Card>
      <CardHeader
        body="Signup revenue per day for last 30 days"
        title="Signup Revenue"
      />
      <div className="m-5">
        <Bar
          data={{
            datasets: [
              {
                backgroundColor: colors.blue["500"],
                borderRadius: 3,
                data: data.map((signup) => signup.count),
                label: "Signups"
              }
            ],
            labels: data.map((signup) => formatDate(signup.date, "MMM D"))
          }}
          options={{
            plugins: { legend: { display: false } },
            responsive: true
          }}
        />
      </div>
    </Card>
  );
};

export default SignupRevenue;
