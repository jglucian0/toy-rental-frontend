import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useRef } from "react";
import { Menu } from "@headlessui/react";


export default function Index() {

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample party data
  const [locacoes, setLocacoes] = useState([]);
  const [partyStatuses, setPartyStatuses] = useState({});

  useEffect(() => {
    const fetchLocacoes = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/locacoes-hoje/");
        const data = await response.json();
        setLocacoes(data);

        // Aqui atualiza partyStatuses:
        const statuses = data.reduce((acc, loc) => {
          acc[loc.id] = loc.status;
          return acc;
        }, {});
        setPartyStatuses(statuses);
      } catch (error) {
        console.error("Erro ao buscar locações:", error);
      }
    };
    fetchLocacoes();
  }, []);

  const formatTelefone = (tel: string) => {
    if (tel.length === 11) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    }
    return tel;
  };

  const mapApiToParty = (locacao: any) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pendente: {
        text: "Pendente",
        color: "bg-[#fef9c3] text-[#854d0e]",
      },
      confirmado: {
        text: "Confirmado",
        color: "bg-[#f3e8ff] text-[#166534]",
      },
      finalizado: {
        text: "Finalizado",
        color: "bg-[#dcfce7] text-[#6b21a8]",
      },


    };


    const rawStatus = String(locacao.status).toLowerCase().trim();
    const statusInfo = statusMap[rawStatus] || statusMap["pendente"];

    return {
      id: locacao.id,
      cliente: locacao.cliente.nome,
      telefone: formatTelefone(locacao.cliente.telefone),
      hora_festa: locacao.hora_festa.slice(0, 5),
      data_festa: locacao.data_festa,
      status: rawStatus,
      statusText: statusInfo.text,
      statusColor: statusInfo.color,
      valor_total: `R$ ${parseFloat(locacao.valor_total).toFixed(2).replace(".", ",")}`,
      items: locacao.brinquedos.map((b: any) => `${b.nome} (1)`),
    };
  };



  const mappedParties = locacoes.map(locacao => {
    // Usa o status do state atualizado se existir:
    const updatedStatus = partyStatuses[locacao.id] || locacao.status;
    return mapApiToParty({ ...locacao, status: updatedStatus });
  });

  // Filter parties by selected date
  const filteredParties = mappedParties.filter(
    (party) => party.data_festa === selectedDate
  );

  // Calculate today's stats
  const today = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();
  const todaysParties = mappedParties.filter(
    (party) => party.data_festa === today
  );
  const todaysRevenue = todaysParties.reduce(
    (sum, party) =>
      sum + parseFloat(party.valor_total.replace("R$ ", "").replace(",", ".")),
    0,
  );

  // Obter ano e mês atual
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Janeiro = 0, então somamos 1

  // Filtrar festas do mês
  const monthlyParties = mappedParties.filter((party) => {
    const [year, month] = party.data_festa.split("-").map(Number);
    return year === currentYear && month === currentMonth;
  });

  const monthlyRevenue = monthlyParties.reduce(
    (sum, party) =>
      sum + parseFloat(party.valor_total.replace("R$ ", "").replace(",", ".")),
    0
  );

  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevYear = prevMonthDate.getFullYear();

  const previousMonthlyParties = mappedParties.filter((party) => {
    const [year, month] = party.data_festa.split("-").map(Number);
    return year === prevYear && month === prevMonth;
  });

  const previousMonthlyRevenue = previousMonthlyParties.reduce(
    (sum, party) =>
      sum + parseFloat(party.valor_total.replace("R$ ", "").replace(",", ".")),
    0
  );

  const festaVariation = previousMonthlyParties.length === 0
    ? 100
    : ((monthlyParties.length - previousMonthlyParties.length) / previousMonthlyParties.length) * 100;

  const rendaVariation = previousMonthlyRevenue === 0
    ? 100
    : ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100;

  // Format date for display (DD/MM)
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = (date.getDate() + 1).toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Format date as YYYY-MM-DD in local timezone to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);
      setShowDatePicker(false);
    }
  };
  // Stats icons
  const PartyIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <path
        d="M15 12C14.1244 12 14.0231 11 12.6719 11C11.3147 11 11.2086 12 10.3359 12C9.47047 12 9.353 11 8 11C6.66119 11 6.52444 12 5.67188 12C4.79225 12 4.69681 11 3.33594 11C1.97509 11 1.87803 12 1 12V9.5C1 8.67188 1.67188 8 2.5 8H3V3.5H5V8H7V3.5H9V8H11V3.5H13V8H13.5C14.3281 8 15 8.67188 15 9.5V12ZM15 16H1V13C2.35487 13 2.46147 12 3.33594 12C4.20941 12 4.31259 13 5.67188 13C7.01072 13 7.14741 12 8 12C8.87962 12 8.97503 13 10.3359 13C11.6908 13 11.7974 12 12.6719 12C13.5309 12 13.6485 13 15 13V16ZM4 3C3.44531 3 3 2.55469 3 2C3 1.03125 4 1.28125 4 0C4.375 0 5 0.921875 5 1.75C5 2.57812 4.55469 3 4 3ZM8 3C7.44531 3 7 2.55469 7 2C7 1.03125 8 1.28125 8 0C8.375 0 9 0.921875 9 1.75C9 2.57812 8.55469 3 8 3ZM12 3C11.4453 3 11 2.55469 11 2C11 1.03125 12 1.28125 12 0C12.375 0 13 0.921875 13 1.75C13 2.57812 12.5547 3 12 3Z"
        fill="#00D17D"
      />
    </svg>
  );

  const MoneyIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <path
        d="M8.8 8.8H8.4V6.6C8.4 6.4895 8.3105 6.4 8.2 6.4H7.8605C7.742 6.4 7.62625 6.435 7.52775 6.50075L7.1445 6.75625C7.12264 6.7708 7.10387 6.78952 7.08925 6.81133C7.07463 6.83314 7.06445 6.85762 7.0593 6.88337C7.05414 6.90912 7.05411 6.93563 7.05921 6.96139C7.06431 6.98715 7.07443 7.01165 7.089 7.0335L7.311 7.36625C7.32555 7.3881 7.34427 7.40688 7.36608 7.4215C7.3879 7.43612 7.41238 7.4463 7.43812 7.45145C7.46387 7.45661 7.49038 7.45664 7.51614 7.45154C7.5419 7.44644 7.5664 7.43632 7.58825 7.42175L7.6 7.414V8.8H7.2C7.0895 8.8 7 8.8895 7 9V9.4C7 9.5105 7.0895 9.6 7.2 9.6H8.8C8.9105 9.6 9 9.5105 9 9.4V9C9 8.8895 8.9105 8.8 8.8 8.8ZM15.2 3.2H0.8C0.35825 3.2 0 3.55825 0 4V12C0 12.4417 0.35825 12.8 0.8 12.8H15.2C15.6418 12.8 16 12.4417 16 12V4C16 3.55825 15.6418 3.2 15.2 3.2ZM1.2 11.6V10C2.08375 10 2.8 10.7162 2.8 11.6H1.2ZM1.2 6V4.4H2.8C2.8 5.28375 2.08375 6 1.2 6ZM8 10.8C6.6745 10.8 5.6 9.54625 5.6 8C5.6 6.4535 6.6745 5.2 8 5.2C9.3255 5.2 10.4 6.4535 10.4 8C10.4 9.54675 9.325 10.8 8 10.8ZM14.8 11.6H13.2C13.2 10.7162 13.9163 10 14.8 10V11.6ZM14.8 6C13.9163 6 13.2 5.28375 13.2 4.4H14.8V6Z"
        fill="#22C55E"
      />
    </svg>
  );

  const TrendUpIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <path
        d="M2.09062 9.04688L1.39687 8.35313C1.10312 8.05938 1.10312 7.58438 1.39687 7.29376L7.46875 1.21876C7.7625 0.925006 8.2375 0.925006 8.52812 1.21876L14.6 7.29063C14.8937 7.58438 14.8937 8.05938 14.6 8.35001L13.9062 9.04376C13.6094 9.34063 13.125 9.33438 12.8344 9.03126L9.25 5.26876V14.25C9.25 14.6656 8.91562 15 8.5 15H7.5C7.08437 15 6.75 14.6656 6.75 14.25V5.26876L3.1625 9.03438C2.87187 9.34063 2.3875 9.34688 2.09062 9.04688Z"
        fill="#22C55E"
      />
    </svg>
  );

  const TrendDownIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <path
        d="M13.9094 6.95312L14.6031 7.64688C14.8969 7.94063 14.8969 8.41563 14.6031 8.70624L8.53125 14.7812C8.2375 15.075 7.7625 15.075 7.47188 14.7812L1.4 8.70937C1.10625 8.41563 1.10625 7.94063 1.4 7.65L2.09375 6.95625C2.39063 6.65937 2.875 6.66562 3.16562 6.96874L6.75 10.7312V1.75C6.75 1.33438 7.08438 1 7.5 1H8.5C8.91562 1 9.25 1.33438 9.25 1.75V10.7312L12.8375 6.96563C13.1281 6.65937 13.6125 6.65312 13.9094 6.95312Z"
        fill="#EF4444"
      />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <path
        d="M5.61334 1.33334V4.00001"
        stroke="#020817"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.9467 1.33334V4.00001"
        stroke="#020817"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9467 2.66666H3.61336C2.87698 2.66666 2.28003 3.26361 2.28003 3.99999V13.3333C2.28003 14.0697 2.87698 14.6667 3.61336 14.6667H12.9467C13.6831 14.6667 14.28 14.0697 14.28 13.3333V3.99999C14.28 3.26361 13.6831 2.66666 12.9467 2.66666Z"
        stroke="#020817"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.28003 6.66666H14.28"
        stroke="#020817"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const TrendIcon = (value: number) =>
    value >= 0 ? <TrendUpIcon /> : <TrendDownIcon />;

  const formattedVariation =
    festaVariation >= 0
      ? `+${festaVariation.toFixed(0)}%`
      : `${festaVariation.toFixed(0)}%`;

  const variationColor = Number(festaVariation) >= 0 ? "text-green-500" : "text-red-500";

  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado" },
    { value: "finalizado", label: "Finalizado" },
  ];





  const updateStatus = async (festaId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/locacoes/${festaId}/status/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setPartyStatuses(prev => ({
          ...prev,
          [festaId]: newStatus,
        }));
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>

      {/* Stats Cards Container */}
      <div className="hidden md:flex pb-3 items-start gap-4 self-stretch flex-wrap xl:flex-nowrap m:hidden">
        <StatCard
          title="Festas Hoje"
          value={todaysParties.length.toString()}
          icon={<PartyIcon />}
          borderColor="border-l-[#00d17d]"
        />
        <StatCard
          title="Renda Bruta Hoje"
          value={`R$ ${todaysRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<MoneyIcon />}
          borderColor="border-l-[#fb923c]"
        />
        <StatCard
          title="Festas no Mês"
          value={monthlyParties.length.toString()}
          icon={<PartyIcon />}
          borderColor="border-l-[#22d3ee]"
          trend={{
            icon: TrendIcon(festaVariation),
            value: <span className={variationColor}>{formattedVariation}</span>,
            label: "mês Anterior",
          }}
        />
        <StatCard
          title="Renda Bruta Mensal"
          value={`R$ ${monthlyRevenue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`}
          icon={<MoneyIcon />}
          borderColor="border-l-[#facc15]"
          trend={{
            icon: TrendIcon(festaVariation),
            value: <span className={variationColor}>{formattedVariation}</span>,
            label: "mês Anterior",
          }}
        />
      </div>

      <div className="w-full overflow-x-auto md:hidden">
        <div className="flex gap-4 w-max">
          <StatCard
            title="Festas Hoje"
            value={todaysParties.length.toString()}
            icon={<PartyIcon />}
            borderColor="border-l-[#00d17d]"
          />
          <StatCard
            title="Renda Bruta Hoje"
            value={`R$ ${todaysRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={<MoneyIcon />}
            borderColor="border-l-[#fb923c]"
          />
          <StatCard
            title="Festas no Mês"
            value={monthlyParties.length.toString()}
            icon={<PartyIcon />}
            borderColor="border-l-[#22d3ee]"
            trend={{
              icon: TrendIcon(festaVariation),
              value: <span className={variationColor}>{formattedVariation}</span>,
              label: "mês Anterior",
            }}
          />
          <StatCard
            title="Renda Bruta Mensal"
            value={`R$ ${monthlyRevenue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
            icon={<MoneyIcon />}
            borderColor="border-l-[#facc15]"
            trend={{
              icon: TrendIcon(festaVariation),
              value: <span className={variationColor}>{formattedVariation}</span>,
              label: "mês Anterior",
            }}
          />
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Próximas Festas
          </div>
          <div className="flex items-center gap-2 relative" ref={datePickerRef}>
            <div className="text-[#a1a1aa] font-exo text-lg font-bold leading-7">
              {formatDisplayDate(selectedDate)}
            </div>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex h-9 max-w-[176px] py-[9px] px-[17px] items-center self-stretch rounded-md border border-[#e2e8f0] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <CalendarIcon />
            </button>

            {/* Date Picker */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate + "T00:00:00")}
                  onSelect={handleDateChange}
                  className="rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Party List */}
        <div className="flex flex-col items-start self-stretch gap-3 mt-6">
          {filteredParties.length > 0 ? (
            filteredParties.map((party) => {
              const status = partyStatuses[party.id];
              const selected = statusOptions.find(s => s.value === status);

              return (
                <div key={party.id} className="w-full flex flex-col gap-2">

                  <div className={`w-full min-h-[144px] rounded-xl p-4 flex flex-col gap-2 ${party.status === "delivered"
                    ? "bg-white border border-[#f3e8ff]"
                    : "bg-[#faf5ff]"
                    }`}
                  >
                    {/* Top Section - Client Info and Status */}
                    <div className="flex justify-between items-start w-full">
                      {/* Left - Client Info */}
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex w-fit h-7 py-0.5 justify-center items-center">
                          <div className="text-[#1f2937] font-exo text-lg font-semibold leading-7">
                            {party.cliente}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-[#9333ea] font-exo text-sm font-medium leading-5">
                            {party.hora_festa}
                          </div>
                          <div className="text-[#6b7280] font-exo text-sm font-normal leading-5">
                            {party.telefone}
                          </div>
                        </div>
                      </div>

                      {/* Right - Status Badge */}
                      <div className={`flex items-center gap-2 py-2 h-9`}>
                        <div className="">
                          <Menu as='div' className="w-full">
                            <Menu.Button
                              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${status === "pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "confirmado"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                                }`}
                            >


                              {/* Right - Status Badge */}
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-full h-9`}
                              >
                                {party.status === "confirmado" && (
                                  <svg
                                    width="17"
                                    height="16"
                                    viewBox="0 0 17 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 flex-shrink-0"
                                  >
                                    <path
                                      d="M14.0833 4L6.74999 11.3333L3.41666 8"
                                      stroke="#166534"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                                {party.status === "finalizado" && (
                                  <svg
                                    width="17"
                                    height="16"
                                    viewBox="0 0 17 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 flex-shrink-0"
                                  >
                                    <path
                                      d="M7.58333 14.4867C7.78603 14.6037 8.01595 14.6653 8.25 14.6653C8.48405 14.6653 8.71397 14.6037 8.91667 14.4867L13.5833 11.82C13.7858 11.7031 13.954 11.535 14.071 11.3326C14.188 11.1301 14.2498 10.9005 14.25 10.6667V5.33335C14.2498 5.09953 14.188 4.86989 14.071 4.66746C13.954 4.46503 13.7858 4.29692 13.5833 4.18002L8.91667 1.51335C8.71397 1.39633 8.48405 1.33472 8.25 1.33472C8.01595 1.33472 7.78603 1.39633 7.58333 1.51335L2.91667 4.18002C2.71418 4.29692 2.54599 4.46503 2.42897 4.66746C2.31196 4.86989 2.25024 5.09953 2.25 5.33335V10.6667C2.25024 10.9005 2.31196 11.1301 2.42897 11.3326C2.54599 11.535 2.71418 11.7031 2.91667 11.82L7.58333 14.4867Z"
                                      stroke="#6B21A8"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M8.25 14.6667V8"
                                      stroke="#6B21A8"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M2.44333 4.66669L8.25 8.00002L14.0567 4.66669"
                                      stroke="#6B21A8"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M5.25 2.84668L11.25 6.28001"
                                      stroke="#6B21A8"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                                {party.status === "pendente" && (
                                  <svg
                                    width="17"
                                    height="16"
                                    viewBox="0 0 17 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 flex-shrink-0"
                                  >
                                    <path
                                      d="M8.75001 14.6666C12.4319 14.6666 15.4167 11.6819 15.4167 7.99998C15.4167 4.31808 12.4319 1.33331 8.75001 1.33331C5.06811 1.33331 2.08334 4.31808 2.08334 7.99998C2.08334 11.6819 5.06811 14.6666 8.75001 14.6666Z"
                                      stroke="#854D0E"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M8.75 4V8L11.4167 9.33333"
                                      stroke="#854D0E"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}

                              </div>
                              {selected.label}
                              <div>
                                <svg
                                  width="17"
                                  height="16"
                                  viewBox="0 0 17 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 flex-shrink-0 opacity-70"
                                >
                                  <g opacity="0.7">
                                    <path
                                      d="M4.2 6L8.2 10L12.2 6"
                                      stroke="currentColor"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </g>
                                </svg>
                              </div>
                            </Menu.Button>

                            <Menu.Items className="absolute z-50 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                              {statusOptions.map((option) => (
                                <Menu.Item key={option.value}>
                                  {({ active }) => (
                                    <button onClick={() => updateStatus(party.id, option.value)} className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-sm flex items-center gap-2 text-left`}>
                                      <span className={`flex font-medium ${option.value === "pendente" ? "text-[#854d0e]" : option.value === "confirmado" ? "text-[#166534]" : option.value === "finalizado" ? "text-[#6b21a8]" : "text-gray-600"}`}>
                                        {option.label}
                                      </span>
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>

                          </Menu>
                        </div>

                      </div>

































                    </div>

                    {/* Bottom Section - Value, Items, Actions */}
                    <div className="flex justify-between items-end w-full mt-4">
                      {/* Left - Value and Items */}
                      <div className="flex gap-8 items-end">
                        {/* Value */}
                        <div className="flex flex-col gap-1">
                          <div className="text-[#6b7280] font-exo text-xs font-normal leading-4">
                            Valor Total
                          </div>
                          <div className="text-[#1f2937] font-exo text-base font-medium leading-6">
                            {party.valor_total}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="hidden md:flex flex flex-col justify-center h-[43px]">
                          <div className="text-[#a1a1aa] font-exo text-base font-normal leading-6">
                            <div className='grid grid-flow-col grid-rows-2 gap-x-4 gap-y-1'>
                              {party.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="text-[#a1a1aa] font-exo text-base font-normal leading-6">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right - Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex w-9 h-9 p-2 justify-center items-center rounded bg-[#dbeafe] hover:bg-[#bfdbfe] transition-colors">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 flex-shrink-0"
                          >
                            <path
                              d="M10 15.4166L7.5 14.1666L2.5 16.6666V5.83331L7.5 3.33331L12.5 5.83331L17.5 3.33331V9.58331"
                              stroke="#2563EB"
                              strokeWidth="1.66667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7.5 3.33331V14.1666"
                              stroke="#2563EB"
                              strokeWidth="1.66667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12.5 5.83331V10.4166"
                              stroke="#2563EB"
                              strokeWidth="1.66667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M17.6008 16.7675C17.9505 16.4179 18.1887 15.9724 18.2852 15.4875C18.3817 15.0025 18.3323 14.4998 18.1431 14.0429C17.9539 13.5861 17.6335 13.1956 17.2223 12.9208C16.8112 12.6461 16.3278 12.4995 15.8333 12.4995C15.3388 12.4995 14.8554 12.6461 14.4443 12.9208C14.0332 13.1956 13.7127 13.5861 13.5235 14.0429C13.3343 14.4998 13.2849 15.0025 13.3814 15.4875C13.4779 15.9724 13.7161 16.4179 14.0658 16.7675C14.4141 17.1167 15.0033 17.6383 15.8333 18.3333C16.7091 17.5917 17.2991 17.07 17.6008 16.7675Z"
                              stroke="#2563EB"
                              strokeWidth="1.66667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.8333 15V15.0083"
                              stroke="#2563EB"
                              strokeWidth="1.66667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button className="flex w-9 h-9 p-2 justify-center items-center rounded bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 flex-shrink-0"
                          >
                            <path
                              d="M9.99998 8.33331C9.08331 8.33331 8.33331 9.08331 8.33331 9.99998C8.33331 10.9166 9.08331 11.6666 9.99998 11.6666C10.9166 11.6666 11.6666 10.9166 11.6666 9.99998C11.6666 9.08331 10.9166 8.33331 9.99998 8.33331ZM9.99998 3.33331C9.08331 3.33331 8.33331 4.08331 8.33331 4.99998C8.33331 5.91665 9.08331 6.66665 9.99998 6.66665C10.9166 6.66665 11.6666 5.91665 11.6666 4.99998C11.6666 4.08331 10.9166 3.33331 9.99998 3.33331ZM9.99998 13.3333C9.08331 13.3333 8.33331 14.0833 8.33331 15C8.33331 15.9166 9.08331 16.6666 9.99998 16.6666C10.9166 16.6666 11.6666 15.9166 11.6666 15C11.6666 14.0833 10.9166 13.3333 9.99998 13.3333Z"
                              fill="#4B5563"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex py-[52px] pb-7 flex-col items-start self-stretch">
              <div className="flex-1 text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7 flex justify-center items-center self-stretch">
                Nenhuma festa na data selecionada...
              </div>
            </div>
          )}
        </div>
      </div>

    </Layout>

  );
}
