import Link from "next/link";
import { BookOpen, CheckCircle2, PlayCircle, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getStudentStats } from "@/lib/data";
import { getT } from "@/lib/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/dashboard/course-card";

export default async function StudentDashboardPage() {
  const user = await requireUser();
  const [stats, { t }] = await Promise.all([getStudentStats(user.id), getT()]);
  const firstName = (user.profile?.name || t.shell.student).split(" ")[0];

  const metrics = [
    {
      label: t.dashboardHome.activeCourses,
      value: stats.coursesCount,
      icon: BookOpen,
    },
    {
      label: t.dashboardHome.lessonsCompleted,
      value: `${stats.lessonsCompleted}/${stats.totalLessons}`,
      icon: CheckCircle2,
    },
    {
      label: t.dashboardHome.overallProgress,
      value: `${stats.percent}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.dashboardHome.greeting(firstName)}</h1>
        <p className="mt-1 text-neutral-400">{t.dashboardHome.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/15 text-accent-300">
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-2xl text-text tabular-nums">{m.value}</div>
                <div className="text-xs text-neutral-400">{m.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-text">{t.dashboardHome.myCourses}</h2>
          {stats.coursesCount > 0 && (
            <Link href="/dashboard/courses" className="text-sm text-accent-300 hover:underline">
              {t.dashboardHome.viewAll}
            </Link>
          )}
        </div>

        {stats.courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10 text-center">
              <PlayCircle className="h-10 w-10 text-accent-300" />
              <div>
                <p className="text-text font-heading text-lg">{t.dashboardHome.noCoursesYet}</p>
                <p className="text-sm text-neutral-400 mt-1">{t.dashboardHome.noCoursesHint}</p>
              </div>
              <Link href="/dashboard/courses">
                <Button>{t.dashboardHome.viewPlans}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.courses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} userId={user.id} t={t} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-400">{t.dashboardHome.overallProgramProgress}</span>
            <span className="text-sm font-heading text-accent-300">{stats.percent}%</span>
          </div>
          <Progress value={stats.percent} />
        </CardContent>
      </Card>
    </div>
  );
}
