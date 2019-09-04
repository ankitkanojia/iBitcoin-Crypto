create table forexratedata
(
    ForexRateId bigint auto_increment
        primary key,
    base        varchar(10) charset utf8           not null,
    currency    varchar(10) charset utf8           not null,
    rates       double                             not null,
    CreatedDate datetime default CURRENT_TIMESTAMP null
);

create table livetradedata
(
    TradeId         bigint auto_increment
        primary key,
    symbol          varchar(50) charset utf8           not null,
    side            varchar(50) charset utf8           not null,
    size            double                             not null,
    price           double                             not null,
    tickDirection   varchar(100) charset utf8          not null,
    trdMatchID      varchar(500) charset utf8          not null,
    grossValue      double                             not null,
    homeNotional    double                             not null,
    foreignNotional double                             not null,
    CreatedDate     datetime default CURRENT_TIMESTAMP not null
);

create table orders
(
    OrderId        bigint auto_increment
        primary key,
    StatusMasterId int                                not null,
    PriceUsd       double                             not null,
    PriceInr       int                                not null,
    PriceGbp       int                                not null,
    IsBuy          bit                                not null,
    Amount         double                             not null,
    ExecutionPrice double                             not null,
    BitcoinQuntity double                             not null,
    Symbol         varchar(50) charset utf8           not null,
    UserId         bigint                             not null,
    UpdatedDate    datetime                           null,
    IsActive       bit      default b'1'              not null,
    IsDelete       bit      default b'0'              not null,
    CreatedDate    datetime default CURRENT_TIMESTAMP not null
);

create index orders_users_UserId_fk
    on orders (UserId);

create table sessions
(
    session_id varchar(128) collate utf8mb4_bin not null
        primary key,
    expires    int(11) unsigned                 not null,
    data       text collate utf8mb4_bin         null
);

create table statusmaster
(
    StatusMasterId bigint auto_increment
        primary key,
    Status         varchar(100) charset utf8 not null
);

create table users
(
    UserId      bigint auto_increment
        primary key,
    FullName    varchar(500) charset utf8          not null,
    Email       varchar(100) charset utf8          not null,
    Mobile      varchar(20)                        null,
    Password    varchar(255) charset utf8          not null,
    CreatedDate datetime default CURRENT_TIMESTAMP not null
);

create table wallet
(
    WalletId         int auto_increment
        primary key,
    UserId           int                                not null,
    LastTransaction  double                             not null,
    AvailableBalance double                             not null,
    ReferenceId      int                                null,
    Description      varchar(1000)                      null,
    IsCredit         bit                                not null,
    CreatedDate      datetime default CURRENT_TIMESTAMP not null,
    UpdatedDate      datetime                           null on update CURRENT_TIMESTAMP
);

create
    definer = j6lsyd2hffi0h2fn@`%` procedure AddUpdateOrder(IN OrderId bigint, IN StatusMasterId bigint,
                                                            IN PriceUsd double, IN PriceInr double, IN PriceGbp double,
                                                            IN IsBuy bit, IN Amount double, IN ExecutionPrice double,
                                                            IN BitcoinQuntity double, IN Symbol varchar(50),
                                                            IN UserId bigint, IN UpdatedDate datetime)
begin
    if OrderId = 0
    THEN
        insert into orders (StatusMasterId, PriceUsd, PriceInr, PriceGbp, IsBuy, Amount, ExecutionPrice, BitcoinQuntity,
                            Symbol, UserId, UpdatedDate)
        VALUES (StatusMasterId, PriceUsd, PriceInr, PriceGbp, IsBuy, Amount, ExecutionPrice, BitcoinQuntity, Symbol,
                UserId,
                UpdatedDate);
        SET OrderId = last_insert_id();
    end if;

    select OrderId as 'OrderId';
end;

create
    definer = j6lsyd2hffi0h2fn@`%` procedure AddUpdateUsers(IN UserId bigint, IN FullName varchar(500),
                                                            IN Email varchar(100), IN Mobile varchar(20),
                                                            IN Password varchar(255))
begin
    if UserId = 0
    THEN
        insert into users (FullName, Email, Mobile, Password) VALUES (FullName, Email, Mobile, Password);
        SET UserId = last_insert_id();
    end if;

    select UserId as 'UserId';
end;

